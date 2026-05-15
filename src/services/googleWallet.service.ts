import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { getTemplateById } from '@/config/templates'; // 👈 NOUVEAU : On importe le catalogue

// ------------------------------------------------------------------
// 1. CRÉATION DU MOULE (Google Class - Type Loyalty)
// ------------------------------------------------------------------
export async function createCompanyGoogleClass(company: { id: string, name: string, primaryColor: string, logoUrl: string | null }) {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });
        const client = await auth.getClient();
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        const classId = `${issuerId}.${company.id.replace(/-/g, '')}`; 

        const loyaltyClass = {
            id: classId,
            issuerName: company.name,
            programName: company.name, 
            reviewStatus: "UNDER_REVIEW",
            hexBackgroundColor: company.primaryColor,
            ...(company.logoUrl ? {
                programLogo: {
                    sourceUri: { uri: company.logoUrl },
                    contentDescription: { defaultValue: { language: "fr-FR", value: `Logo ${company.name}` } }
                }
            } : {})
        };

        await client.request({
            url: 'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass',
            method: 'POST',
            data: loyaltyClass,
        });

        console.log("✅ Moule Fidélité créé :", classId);
        return classId;
    } catch (error) {
        console.error("❌ Erreur création Google Class:", error);
        throw new Error("Impossible de créer le modèle");
    }
}

// ------------------------------------------------------------------
// 2. CRÉATION DE LA CARTE DU CLIENT (Google Object - Type Loyalty)
// ------------------------------------------------------------------
export const generateGoogleWalletPass = (
    firstName: string, 
    walletId: string, 
    points: number, 
    classId: string,
    systemType: string, 
    primaryColor: string,
    cardTemplateId: string // 👈 NOUVEAU : L'ID du modèle choisi par le gérant
) => {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 🌟 L'AIGUILLAGE DU CATALOGUE 🌟
    const template = getTemplateById(cardTemplateId);
    let textModules = [];
    let heroImage = undefined;

    if (template.type === 'STAMPS') {
        // MODE TAMPONS
        textModules = [{ id: "stamps", header: "TAMPONS RÉCOLTÉS", body: `${points} / 10` }];
        
        const shape = template.stampShape || 'star'; // On récupère la forme (star, coffee, pizza...)
        
        let imageUrl;
        if (baseUrl.startsWith('https')) {
            // L'URL inclut maintenant le paramètre "shape" !
            imageUrl = `${baseUrl}/api/images/stamps?count=${points}&color=${encodeURIComponent(primaryColor)}&shape=${shape}`;
        } else {
            imageUrl = `https://placehold.co/600x280/${primaryColor.replace('#', '')}/FFFFFF/png?text=${points}+${shape.toUpperCase()}`;
        }

        heroImage = {
            sourceUri: { uri: imageUrl },
            contentDescription: { defaultValue: { language: "fr-FR", value: `Carte avec ${points} tampons` } }
        };
    } else {
        // MODE POINTS CLASSIQUE
        textModules = [{ id: "points", header: "SOLDE FIDÉLITÉ", body: `${points} points` }];
        
        // Si le modèle choisi possède une image de fond (ex: points_gold)
        if (template.backgroundImage) {
            heroImage = {
                sourceUri: { uri: `${baseUrl}${template.backgroundImage}` }, 
                contentDescription: { defaultValue: { language: "fr-FR", value: `Design Premium` } }
            };
        }
    }

    const claims = {
        iss: credentials.client_email,
        aud: 'google',
        typ: 'savetowallet',
        origins: [],
        payload: {
            loyaltyObjects: [{
                id: `${issuerId}.${walletId}`, 
                classId: classId,
                state: 'ACTIVE',
                ...(template.type === 'POINTS' ? { loyaltyPoints: { label: 'Points', balance: { int: points } } } : {}),
                heroImage: heroImage, 
                textModulesData: textModules,
                accountId: walletId,
                accountName: firstName,
                barcode: { type: 'QR_CODE', value: walletId, alternateText: walletId }
            }]
        }
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
    return `https://pay.google.com/gp/v/save/${token}`;
};

// ------------------------------------------------------------------
// 3. MISE À JOUR DES POINTS
// ------------------------------------------------------------------
export const updateWalletPoints = async (
    walletId: string, 
    newPoints: number, 
    systemType: string, 
    primaryColor: string,
    cardTemplateId: string // 👈 NOUVEAU
): Promise<boolean> => {
    try {
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });

        const client = await auth.getClient();
        const objectId = `${issuerId}.${walletId}`;
        const template = getTemplateById(cardTemplateId);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        let updateData: any = {};

        if (template.type === 'STAMPS') {
            const shape = template.stampShape || 'star';
            const imageUrl = baseUrl.startsWith('https') 
                ? `${baseUrl}/api/images/stamps?count=${newPoints}&color=${encodeURIComponent(primaryColor)}&shape=${shape}`
                : `https://placehold.co/600x280/${primaryColor.replace('#', '')}/FFFFFF/png?text=${newPoints}+${shape.toUpperCase()}`;

            updateData = {
                textModulesData: [{ id: "stamps", header: "TAMPONS RÉCOLTÉS", body: `${newPoints} / 10` }],
                heroImage: {
                    sourceUri: { uri: imageUrl },
                    contentDescription: { defaultValue: { language: "fr-FR", value: `Carte avec ${newPoints} tampons` } }
                }
            };
        } else {
            updateData = {
                loyaltyPoints: {
                    label: "Points",
                    balance: { int: newPoints }
                }
            };
        }

        await client.request({
            url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
            method: 'PATCH',
            data: updateData
        });

        return true;
    } catch (error) {
        console.error("❌ Erreur màj Wallet :", error);
        return false;
    }
};