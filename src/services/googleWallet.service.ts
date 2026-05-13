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
export const generateGoogleWalletPass = (firstName: string, walletId: string, points: number, classId: string) => {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;

    const claims = {
        iss: credentials.client_email,
        aud: 'google',
        typ: 'savetowallet',
        origins: [],
        payload: {
            loyaltyObjects: [{ // 👈 On garde bien TON format original
                id: `${issuerId}.${walletId}`, 
                classId: classId, // 👈 On lie au moule dynamique !
                state: 'ACTIVE',
                loyaltyPoints: {
                    label: 'Points',
                    balance: { int: points }
                },
                accountId: walletId,
                accountName: firstName,
                barcode: {
                    type: 'QR_CODE',
                    value: walletId,
                    alternateText: walletId
                }
            }]
        }
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
    return `https://pay.google.com/gp/v/save/${token}`;
};

// ------------------------------------------------------------------
// 3. MISE À JOUR DES POINTS
// ------------------------------------------------------------------
export const updateWalletPoints = async (walletId: string, newPoints: number): Promise<boolean> => {
    try {
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });

        const client = await auth.getClient();
        
        // On met à jour un loyaltyObject
        const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${issuerId}.${walletId}`;
        
        await client.request({
            url,
            method: 'PATCH',
            data: {
                loyaltyPoints: {
                    label: "Points",
                    balance: { int: newPoints }
                }
            }
        });

        return true;
    } catch (error) {
        console.error("❌ Erreur màj Wallet :", error);
        return false;
    }
};