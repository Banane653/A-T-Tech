import { NextResponse } from 'next/server';
import { updateWalletPoints } from '@/services/googleWallet.service';
import { sendAppleWalletPush } from '@/services/appleWallet.service';
import { prisma } from '@/lib/prisma';
import { getScannerAuth } from '@/lib/auth';


const STAMP_LIMIT = 10;

type ScanAction = 'lookup' | 'add_stamp' | 'add_points' | 'spend_points';

async function syncWallet(
    walletId: string,
    newPoints: number,
    company: { systemType: string; primaryColor: string; cardTemplate: string },
    firstName: string
) {
    try {
        await updateWalletPoints(
            walletId,
            newPoints,
            company.systemType,
            company.primaryColor,
            company.cardTemplate,
            firstName,
            "Standard"
        );
    } catch (googleError) {
        console.error('❌ Erreur synchro Google Wallet:', googleError);
    }

    // 👇 2. Le déclencheur pour Apple Wallet 👇
    try {
        await sendAppleWalletPush(walletId);
    } catch (appleError) {
        console.error('❌ Erreur synchro Apple Wallet Push:', appleError);
    }
}

export async function POST(request: Request) {
    try {
        const auth = await getScannerAuth();
        if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const body = await request.json();
        const {
            walletId,
            action = 'lookup',
            amount,
            description,
            rewardId,
        } = body as {
            walletId: string;
            action?: ScanAction;
            amount?: number;
            description?: string;
            rewardId?: string;
        };

        if (!walletId) {
            return NextResponse.json({ error: 'walletId requis' }, { status: 400 });
        }

        const customer = await prisma.customer.findUnique({
            where: { walletId },
            include: { company: true },
        });

        if (!customer) return NextResponse.json({ error: 'Carte non reconnue' }, { status: 404 });
        if (customer.companyId !== auth.companyId) {
            return NextResponse.json({ error: "Ce client n'appartient pas à votre commerce" }, { status: 403 });
        }
        if (!customer.company) {
            return NextResponse.json({ error: 'Commerce introuvable' }, { status: 500 });
        }

        const company = customer.company;
        const customerLabel = `${customer.firstName}${customer.lastName ? ` ${customer.lastName}` : ''}`;

        if (action === 'lookup') {
            const rewards =
                company.systemType === 'POINTS'
                    ? await prisma.reward.findMany({
                          where: { companyId: auth.companyId },
                          orderBy: { cost: 'asc' },
                          select: { id: true, name: true, cost: true },
                      })
                    : [];

            return NextResponse.json({
                success: true,
                customer: {
                    id: customer.id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    points: customer.points,
                },
                systemType: company.systemType,
                stampLimit: STAMP_LIMIT,
                rewards,
            });
        }

        let newPoints = customer.points;
        let transactionType = 'EARN';
        let transactionAmount = 0;
        let transactionDescription = description?.trim() || '';
        let message = '';
        let wasReset = false;

        if (company.systemType === 'STAMPS') {
            if (action !== 'add_stamp') {
                return NextResponse.json({ error: 'Action invalide pour le mode tampons' }, { status: 400 });
            }

            if (customer.points >= STAMP_LIMIT) {
                newPoints = 0;
                transactionType = 'RESET';
                transactionAmount = STAMP_LIMIT;
                transactionDescription =
                    transactionDescription || 'Carte complétée - Cadeau offert';
                message = '🎉 BRAVO ! Donnez le cadeau au client !';
                wasReset = true;
            } else {
                newPoints = customer.points + 1;
                transactionType = 'EARN';
                transactionAmount = 1;
                transactionDescription = transactionDescription || '+1 tampon';
                if (newPoints > STAMP_LIMIT) {
                    message = `🎉 Carte pleine ! (${STAMP_LIMIT}/${STAMP_LIMIT}) — Au prochain scan, offrez le cadeau.`;
                } else {
                    message = `✅ +1 tampon. (${newPoints}/${STAMP_LIMIT})`;
                }
            }
        } else if (company.systemType === 'POINTS') {
            if (action === 'add_points') {
                // 1. Montant en EUROS dépensés par le client
                const eurosSpent = Number(amount) || 0;
                if (eurosSpent <= 0) {
                    return NextResponse.json({ error: 'Montant en euros invalide' }, { status: 400 });
                }

                // 2. NOUVEAU CALCUL : pointsRatio représente désormais le coût en € d'UN point (ex: 5€ = 1pt)
                // On s'assure que le ratio ne soit pas 0 pour éviter une division par zéro fatale.
                const euroCostPerPoint = company.pointsRatio && company.pointsRatio > 0 ? company.pointsRatio : 1;
                
                // 👇 ON DIVISE AU LIEU DE MULTIPLIER 👇
                const pointsToAdd = Math.floor(eurosSpent / euroCostPerPoint);

                if (pointsToAdd <= 0) {
                    return NextResponse.json({ 
                        error: `Le montant est inférieur à ${euroCostPerPoint}€, aucun point généré.` 
                    }, { status: 400 });
                }

                newPoints = customer.points + pointsToAdd;
                transactionType = 'EARN';
                transactionAmount = pointsToAdd;
                
                transactionDescription = 
                    transactionDescription || `Achat de ${eurosSpent.toFixed(2)}€ (+${pointsToAdd} pts)`;
                
                message = `✅ +${pointsToAdd} points ajoutés (Achat: ${eurosSpent.toFixed(2)}€). Nouveau solde : ${newPoints}`;
            } else if (action === 'spend_points') {
                if (!rewardId) {
                    return NextResponse.json({ error: 'Récompense requise' }, { status: 400 });
                }
                const reward = await prisma.reward.findFirst({
                    where: { id: rewardId, companyId: auth.companyId },
                });
                if (!reward) {
                    return NextResponse.json({ error: 'Récompense introuvable' }, { status: 404 });
                }
                if (customer.points < reward.cost) {
                    return NextResponse.json(
                        { error: 'Solde insuffisant pour cette récompense' },
                        { status: 400 }
                    );
                }
                newPoints = customer.points - reward.cost;
                transactionType = 'SPEND';
                transactionAmount = reward.cost;
                transactionDescription =
                    transactionDescription || `Récompense : ${reward.name}`;
                message = `✅ Récompense offerte : ${reward.name}. Solde : ${newPoints}`;
            } else {
                return NextResponse.json({ error: 'Action invalide pour le mode points' }, { status: 400 });
            }
        }

        await prisma.$transaction([
            prisma.customer.update({
                where: { walletId },
                data: { points: newPoints },
            }),
            prisma.transaction.create({
                data: {
                    type: transactionType,
                    amount: transactionAmount,
                    description: transactionDescription,
                    customerId: customer.id,
                    companyId: auth.companyId,
                    merchantUserId: auth.userId,
                },
            }),
        ]);

        await syncWallet(walletId, newPoints, company, customer.firstName);

        return NextResponse.json({
            success: true,
            message,
            newBalance: newPoints,
            wasReset,
            systemType: company.systemType,
            customerName: customerLabel,
            stampLimit: STAMP_LIMIT,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
