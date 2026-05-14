import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

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

        // On utilise bien une LoyaltyClass (et plus GenericClass)
        const loyaltyClass = {
            id: classId,
            issuerName: company.name,
            programName: company.name, // Nom du programme affiché sur la carte
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
            url: 'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass', // 👈 Modifié ici
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
    systemType: string, // 👈 NOUVEAU : On a besoin de savoir si c'est POINTS ou TAMPONS
    primaryColor: string // 👈 NOUVEAU : Pour colorer les tampons
) => {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;

    // 🌟 L'AIGUILLAGE DU DESIGN 🌟
    let textModules = [];
    let heroImage = undefined;

    if (systemType === 'STAMPS') {
        // MODE TAMPONS
        textModules = [{ id: "stamps", header: "TAMPONS RÉCOLTÉS", body: `${points} / 10` }];
        
        // On récupère l'adresse du site configurée dans Vercel ou dans le .env local
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        let imageUrl;
        if (baseUrl.startsWith('https')) {
            // 🚀 ON EST SUR VERCEL : On donne la VRAIE image dynamique à Google !
            imageUrl = `${baseUrl}/api/images/stamps?count=${points}&color=${encodeURIComponent(primaryColor)}`;
        } else {
            // 💻 ON EST SUR LE PC : Google ne peut pas voir notre PC, on donne une image provisoire
            imageUrl = `https://placehold.co/600x280/${primaryColor.replace('#', '')}/FFFFFF/png?text=${points}+TAMPONS`;
        }

        heroImage = {
            sourceUri: { uri: imageUrl },
            contentDescription: { defaultValue: { language: "fr-FR", value: `Carte avec ${points} tampons` } }
        };
    } else {
        // MODE POINTS CLASSIQUE
        textModules = [{ id: "points", header: "SOLDE FIDÉLITÉ", body: `${points} points` }];
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
                // On cache la ligne "points" native si c'est des tampons, sinon Google s'embrouille
                ...(systemType === 'POINTS' ? { loyaltyPoints: { label: 'Points', balance: { int: points } } } : {}),
                heroImage: heroImage, // 👈 On injecte l'image (sera ignorée si undefined)
                textModulesData: textModules, // 👈 On injecte le bon texte
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
    systemType: string,    // 👈 NOUVEAU
    primaryColor: string   // 👈 NOUVEAU
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
        
        // 🌟 PRÉPARATION DES DONNÉES À METTRE À JOUR 🌟
        let updateData: any = {};

        if (systemType === 'STAMPS') {
            // MODE TAMPONS : On met à jour le texte ET la fameuse image !
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const imageUrl = baseUrl.startsWith('https') 
                ? `${baseUrl}/api/images/stamps?count=${newPoints}&color=${encodeURIComponent(primaryColor)}`
                : `https://placehold.co/600x280/${primaryColor.replace('#', '')}/FFFFFF/png?text=${newPoints}+TAMPONS`;

            updateData = {
                textModulesData: [{ id: "stamps", header: "TAMPONS RÉCOLTÉS", body: `${newPoints} / 10` }],
                heroImage: {
                    sourceUri: { uri: imageUrl },
                    contentDescription: { defaultValue: { language: "fr-FR", value: `Carte avec ${newPoints} tampons` } }
                }
            };
        } else {
            // MODE POINTS : On met juste à jour le solde numérique
            updateData = {
                loyaltyPoints: {
                    label: "Points",
                    balance: { int: newPoints }
                }
            };
        }

        console.log(`🚀 Mise à jour Google Wallet pour ${walletId}:`, updateData);

        // On envoie l'ordre de modification à Google
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