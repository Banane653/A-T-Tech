import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { getTemplateById } from '@/config/templates'; 

// 1. CRÉATION DU MOULE (Inchangé)
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
// 2. CRÉATION DE LA CARTE DU CLIENT 
// ------------------------------------------------------------------
export const generateGoogleWalletPass = (
    firstName: string, 
    walletId: string, 
    points: number, 
    classId: string,
    systemType: string, 
    primaryColor: string,
    textColor: string,
    cardTemplateId: string,
    level: string = "Standard",
    maxStamps: number = 10 
) => {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const template = getTemplateById(cardTemplateId);
    let heroImage = undefined;

    let textModules = [
        { id: "member", header: "MEMBRE", body: firstName },
        { id: "level", header: "NIVEAU", body: level }
    ];

    if (systemType === 'STAMPS') {
        const shape = template.stampShape || 'star'; 
        // 👇 AJOUT DE &max= ICI 👇
        let imageUrl = baseUrl.startsWith('https')
            ? `${baseUrl}/api/images/stamps?count=${points}&color=${encodeURIComponent(primaryColor)}&stampColor=${encodeURIComponent(textColor)}&shape=${shape}&max=${maxStamps}&t=${Date.now()}`
            : `https://placehold.co/600x280/${primaryColor.replace('#', '')}/FFFFFF/png?text=${points}+${shape.toUpperCase()}`;

        heroImage = {
            sourceUri: { uri: imageUrl },
            contentDescription: { defaultValue: { language: "fr-FR", value: `Carte avec ${points} tampons` } }
        };
    } else {
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
                ...(systemType === 'POINTS' ? { loyaltyPoints: { label: 'Points', balance: { int: points } } } : {}),
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
    textColor: string,
    cardTemplateId: string,
    firstName: string,
    level: string = "Standard",
    maxStamps: number = 10
): Promise<boolean> => {
    try {
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'] });
        const client = await auth.getClient();
        const objectId = `${issuerId}.${walletId}`;
        const template = getTemplateById(cardTemplateId);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        let textModules = [
            { id: "member", header: "MEMBRE", body: firstName },
            { id: "level", header: "NIVEAU", body: level }
        ];

        let updateData: any = {};

        if (systemType === 'STAMPS') {
            const shape = template.stampShape || 'star';
            // 👇 AJOUT DE &max= ICI 👇
            const imageUrl = baseUrl.startsWith('https') 
                ? `${baseUrl}/api/images/stamps?count=${newPoints}&color=${encodeURIComponent(primaryColor)}&stampColor=${encodeURIComponent(textColor)}&shape=${shape}&max=${maxStamps}&t=${Date.now()}`
                : `https://placehold.co/600x280/${primaryColor.replace('#', '')}/FFFFFF/png?text=${newPoints}+${shape.toUpperCase()}`;

            updateData = {
                textModulesData: textModules,
                heroImage: {
                    sourceUri: { uri: imageUrl },
                    contentDescription: { defaultValue: { language: "fr-FR", value: `Carte avec ${newPoints} tampons` } }
                }
            };
        } else {
            updateData = {
                textModulesData: textModules,
                loyaltyPoints: { label: "Points", balance: { int: newPoints } }
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

// ------------------------------------------------------------------
// 4. ENVOI D'UN MESSAGE MARKETING (PUSH)
// ------------------------------------------------------------------
export const sendGoogleWalletMessage = async (
    walletId: string, 
    title: string, 
    message: string
): Promise<boolean> => {
    try {
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
        const auth = new google.auth.GoogleAuth({ 
            credentials, 
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'] 
        });
        const client = await auth.getClient();
        const objectId = `${issuerId}.${walletId}`;

        // On utilise "PATCH" pour ajouter un message à la carte existante
        // Google affichera ce message en dessous du QR Code et déclenchera une notification
        await client.request({
            url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
            method: 'PATCH',
            data: {
                messages: [{
                    header: title,
                    body: message
                }]
            }
        });

        console.log(`✅ Message Google Wallet envoyé avec succès au client : ${walletId}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur lors de l'envoi du message Google Wallet pour ${walletId}:`, error);
        return false;
    }
};


export const updateGoogleClassLocations = async (
    companyId: string,
    locations: { latitude: number; longitude: number }[]
): Promise<boolean> => {
    try {
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'] });
        const client = await auth.getClient();
        
        const classId = `${issuerId}.${companyId.replace(/-/g, '')}`;

        // On mappe la liste pour qu'elle corresponde exactement au format exigé par Google
        const formattedLocations = locations.map(loc => ({
            latitude: loc.latitude,
            longitude: loc.longitude
        }));

        await client.request({
            url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`,
            method: 'PATCH',
            data: {
                locations: formattedLocations // 👈 On envoie tout le tableau d'un coup
            }
        });

        console.log(`✅ ${formattedLocations.length} coordonnées GPS mises à jour chez Google pour ${companyId}`);
        return true;
    } catch (error) {
        console.error("❌ Erreur màj GPS Google Class:", error);
        return false;
    }
};