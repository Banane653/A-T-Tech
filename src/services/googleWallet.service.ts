import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { getTemplateById } from '@/config/templates'; 

// 1. CRÉATION DU MOULE (Inchangé)
export async function createCompanyGoogleClass(company: { id: string, name: string, primaryColor: string, logoUrl: string | null }) {
    // ... (Garde ton code actuel ici, il est parfait) ...
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
    cardTemplateId: string,
    level: string = "Standard" // 👈 AJOUT: On prévoit le niveau du membre
) => {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const template = getTemplateById(cardTemplateId);
    let heroImage = undefined;

    // 👇 LA GRILLE DE TEXTE (Ce qui va s'afficher au milieu, côte à côte) 👇
    // Google affiche ces modules sur une même ligne s'il y a la place
    let textModules = [
        { id: "member", header: "MEMBRE", body: firstName },
        { id: "level", header: "NIVEAU", body: level }
    ];

    if (systemType === 'STAMPS') {
        const shape = template.stampShape || 'star'; 
        let imageUrl = baseUrl.startsWith('https')
            ? `${baseUrl}/api/images/stamps?count=${points}&color=${encodeURIComponent(primaryColor)}&shape=${shape}`
            : `https://placehold.co/600x280/${primaryColor.replace('#', '')}/FFFFFF/png?text=${points}+${shape.toUpperCase()}`;

        heroImage = {
            sourceUri: { uri: imageUrl },
            contentDescription: { defaultValue: { language: "fr-FR", value: `Carte avec ${points} tampons` } }
        };
    } else {
        // En mode point, on peut ajouter le solde si tu le souhaites
        textModules.push({ id: "points", header: "SOLDE", body: `${points} points` });
        
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
                // (Optionnel : Affiche le petit compteur de points officiel de Google en haut à droite)
                ...(systemType === 'POINTS' ? { loyaltyPoints: { label: 'Points', balance: { int: points } } } : {}),
                heroImage: heroImage, 
                textModulesData: textModules, // 👈 Les champs "Membre" et "Niveau"
                accountId: walletId,
                accountName: firstName,
                barcode: { type: 'QR_CODE', value: walletId, alternateText: walletId } // 👈 Le QR Code tout en bas
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
    cardTemplateId: string,
    firstName: string,  // 👈 Nécessaire pour garder l'affichage du nom
    level: string = "Standard" 
): Promise<boolean> => {
    // ... (Même logique pour l'update, on s'assure que textModules garde Membre et Niveau) ...
    try {
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'] });
        const client = await auth.getClient();
        const objectId = `${issuerId}.${walletId}`;
        const template = getTemplateById(cardTemplateId);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        // On réinjecte les textes pour qu'ils ne disparaissent pas
        let textModules = [
            { id: "member", header: "MEMBRE", body: firstName },
            { id: "level", header: "NIVEAU", body: level }
        ];

        let updateData: any = {};

        if (systemType === 'STAMPS') {
            const shape = template.stampShape || 'star';
            const imageUrl = baseUrl.startsWith('https') 
                ? `${baseUrl}/api/images/stamps?count=${newPoints}&color=${encodeURIComponent(primaryColor)}&shape=${shape}`
                : `https://placehold.co/600x280/${primaryColor.replace('#', '')}/FFFFFF/png?text=${newPoints}+${shape.toUpperCase()}`;

            updateData = {
                textModulesData: textModules,
                heroImage: {
                    sourceUri: { uri: imageUrl },
                    contentDescription: { defaultValue: { language: "fr-FR", value: `Carte avec ${newPoints} tampons` } }
                }
            };
        } else {
            textModules.push({ id: "points", header: "SOLDE", body: `${newPoints} points` });
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