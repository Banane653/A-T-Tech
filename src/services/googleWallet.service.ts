import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

// ❌ Fini le import credentials from '../../credentials.json' !

/**
 * Génère le lien d'ajout à Google Wallet (Pour le client)
 */
export const generateGoogleWalletPass = (firstName: string, walletId: string, points: number) => {
    // ✅ On récupère les clés depuis les variables d'environnement (Sécurisé !)
    const issuerId = process.env.GOOGLE_ISSUER_ID;
    const classId = process.env.GOOGLE_CLASS_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!issuerId || !classId || !clientEmail || !privateKey) {
        throw new Error("Variables d'environnement Google manquantes.");
    }

    const claims = {
        iss: clientEmail,
        aud: 'google',
        typ: 'savetowallet',
        origins: [],
        payload: {
            loyaltyObjects: [{
                id: `${issuerId}.${walletId}`,
                classId: `${issuerId}.${classId}`,
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

    const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' });
    return `https://pay.google.com/gp/v/save/${token}`;
};

/**
 * Met à jour les points d'une carte déjà installée (Pour le commerçant)
 */
export const updateWalletPoints = async (walletId: string, newPoints: number): Promise<boolean> => {
    try {
        const issuerId = process.env.GOOGLE_ISSUER_ID;
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!issuerId || !clientEmail || !privateKey) throw new Error("Variables Google manquantes");

        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: clientEmail, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });

        const client = await auth.getClient();
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
        console.error("❌ Erreur lors de la mise à jour Google Wallet :", error);
        return false;
    }
};