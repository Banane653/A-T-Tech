import jwt from 'jsonwebtoken';
// On importe ton fichier secret (assure-toi qu'il est bien à la racine du projet)
import credentials from '../../credentials.json';
import { google } from 'googleapis';

/**
 * Génère un lien Google Wallet pour un client spécifique
 */
export const generateGoogleWalletPass = (clientName: string, accountId: string, points: number): string => {
    // On récupère tes identifiants depuis le fichier .env
    const issuerId = process.env.GOOGLE_ISSUER_ID;
    const classId = process.env.GOOGLE_CLASS_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // Astuce cruciale : réparer les sauts de ligne de la clé privée qui sont parfois cassés par les hébergeurs
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!issuerId || !classId || !clientEmail || !privateKey) {
        throw new Error("Variables d'environnement Google manquantes !");
    }

    // 1. Création de l'objet (La carte de ce client précis)
    const loyaltyObject = {
        id: `${issuerId}.${Date.now()}`,
        classId: classId,
        state: "ACTIVE",
        accountId: accountId,
        accountName: clientName,
        barcode: {
            type: "QR_CODE",
            value: accountId, // Le texte caché dans le QR Code
            alternateText: accountId
        },
        loyaltyPoints: {
            label: "Points",
            balance: { int: points }
        }
    };

    // 2. Préparation du Payload
    const payload = {
        iss: clientEmail,
        aud: "google",
        typ: "savetowallet",
        origins: [],
        payload: {
            loyaltyObjects: [loyaltyObject]
        }
    };

    // 3. Signature et génération du lien
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    return `https://pay.google.com/gp/v/save/${token}`;
};

export const updateWalletPoints = async (walletId: string, newPoints: number): Promise<boolean> => {
    try {
        const issuerId = process.env.GOOGLE_ISSUER_ID;
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!issuerId || !clientEmail || !privateKey) throw new Error("Variables Google manquantes");

        // 1. Authentification en tant que "Robot Administrateur"
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: clientEmail, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });

        const client = await auth.getClient();
        
        // 2. On prépare la requête pour modifier l'objet (la carte du client)
        const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${issuerId}.${walletId}`;
        
        // 3. On envoie uniquement la modification des points (Méthode PATCH)
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

        console.log(`✅ Carte Google Wallet ${walletId} mise à jour avec ${newPoints} points !`);
        return true;

    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour Google Wallet :", error);
        return false;
    }
};