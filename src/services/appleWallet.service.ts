import http2 from 'node:http2';
import { prisma } from '@/lib/prisma';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PKPass } from 'passkit-generator';
import sharp from 'sharp';
import { getCardTemplateData } from '@/lib/wallet-templates';

export async function sendAppleWalletPush(walletId: string) {
  // 1. On cherche tous les iPhones qui se sont enregistrés pour ce client
  const registrations = await prisma.applePassRegistration.findMany({
    where: {
      serialNumber: {
        startsWith: walletId, // Trouve le numéro de série lié au client
      },
    },
  });

  if (registrations.length === 0) {
    console.log(`ℹ️ Aucun iPhone enregistré pour le client ${walletId} actuellement.`);
    return;
  }

  const cert = process.env.APPLE_WALLET_CERT;
  const key = process.env.APPLE_WALLET_KEY;
  const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER;

  if (!cert || !key || !passTypeIdentifier) {
    console.error("❌ Variables d'environnement APPLE_WALLET manquantes pour le Push Notification.");
    return;
  }

  // 2. On envoie un signal push à chaque iPhone enregistré
  for (const reg of registrations) {
    try {
      await new Promise<void>((resolve, reject) => {
        // Apple Wallet centralise toutes ses notifications sur sa passerelle de production
        const client = http2.connect('https://api.push.apple.com:443', {
          cert: cert,
          key: key,
        });

        client.on('error', (err) => reject(err));

        // Le protocole d'Apple impose un payload JSON totalement vide {} pour les cartes
        const payload = JSON.stringify({});
        
        const req = client.request({
          ':method': 'POST',
          ':path': `/3/device/${reg.pushToken}`,
          'apns-topic': passTypeIdentifier,
          'apns-push-type': 'background', // Indique une mise à jour d'arrière-plan
          'apns-priority': '10',
          'content-length': Buffer.byteLength(payload),
        });

        req.on('response', (headers) => {
          const status = headers[':status'];
          if (status === 200) {
            console.log(`🔔 Signal de mise à jour envoyé à l'iPhone : ${reg.deviceLibraryIdentifier}`);
          } else {
            console.error(`⚠️ Apple APNs a répondu avec le statut : ${status}`);
          }
        });

        req.on('error', (err) => reject(err));
        req.write(payload);
        req.end();

        req.on('close', () => {
          client.close();
          resolve();
        });
      });
    } catch (err) {
      console.error(`❌ Échec de l'envoi du push pour l'enregistrement ${reg.id}:`, err);
    }
  }
}

export async function generateApplePassBuffer(customer: any, host: string, protocol: string): Promise<Buffer> {
  const FALLBACK_PIXEL_BUFFER = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s5Vn6QAAAAASUVORK5CYII=', 'base64');
  const templateData = getCardTemplateData(customer.company, customer);
  const serialNumber = templateData.customer.walletId;
  
  // Gestion du logo
  let logoBuffer = FALLBACK_PIXEL_BUFFER;
  if (templateData.images.logoUrl) {
    try {
      const res = await fetch(templateData.images.logoUrl, { cache: 'no-store' });
      if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
    } catch (e) { console.error("Erreur logo"); }
  }

  // Gestion de l'icône
  let iconBuffer = FALLBACK_PIXEL_BUFFER;
  try {
    iconBuffer = await readFile(path.join(process.cwd(), 'public', 'assets', 'default_icon.png'));
  } catch (e) { console.error("Pas d'icône par défaut"); }

  const signerCert = process.env.APPLE_WALLET_CERT!;
  const signerKey = process.env.APPLE_WALLET_KEY!;
  const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER!;
  const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER!;
  const wwdr = process.env.APPLE_WALLET_WWDR || signerCert;

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber,
    // L'URL de ton API pour que l'iPhone sache qui contacter
    webServiceURL: `${protocol}://${host}/api/wallet/apple`,
    authenticationToken: customer.walletId,
    groupingIdentifier: customer.company.id,
    organizationName: "CARTE FIDÉLITÉ",
    logoText: templateData.merchant.name,
    description: `${templateData.merchant.name} - Carte de fidélité`,
    foregroundColor: `rgb(${parseInt(templateData.colors.text.slice(1, 3), 16)}, ${parseInt(templateData.colors.text.slice(3, 5), 16)}, ${parseInt(templateData.colors.text.slice(5, 7), 16)})`,
    backgroundColor: `rgb(${parseInt(templateData.colors.background.slice(1, 3), 16)}, ${parseInt(templateData.colors.background.slice(3, 5), 16)}, ${parseInt(templateData.colors.background.slice(5, 7), 16)})`,
    labelColor: `rgb(${parseInt(templateData.colors.label.slice(1, 3), 16)}, ${parseInt(templateData.colors.label.slice(3, 5), 16)}, ${parseInt(templateData.colors.label.slice(5, 7), 16)})`,
    storeCard: {
      primaryFields: templateData.loyalty.systemType === "POINTS" ? [
        { key: "points", label: "POINTS", value: String(templateData.loyalty.points) }
      ] : [],
      secondaryFields: [], 
      auxiliaryFields: [
        { key: "member", label: "MEMBRE", value: templateData.customer.fullName },
        { key: "level", label: "NIVEAU", value: `${templateData.loyalty.level} - ${templateData.loyalty.pointsToReward}` }
      ],
      backFields: [
        { key: "email", label: "Email", value: templateData.customer.email },
        { key: "walletId", label: "Identifiant", value: templateData.customer.walletId },
        
        // 🚀 C'EST ICI QUE TOUT SE JOUE POUR LE MODE "DISCRET" 🚀
        { 
            key: "marketingMessage", 
            label: "Dernière offre", 
            value: "Gagnez des points à chaque visite !", // Texte par défaut
            changeMessage: "%@" // C'est ce code qui dit à Apple : "Envoie un push si ça change !"
        }
      ],
    },
    barcodes: [{
      format: 'PKBarcodeFormatQR',
      message: templateData.qr.value,
      messageEncoding: 'iso-8859-1',
      altText: templateData.customer.walletId,
    }],
  };

  const pass = new PKPass({
    'pass.json': Buffer.from(JSON.stringify(passJson)),
    'icon.png': iconBuffer,
    'icon@2x.png': iconBuffer,
  }, { wwdr, signerCert, signerKey });

  pass.addBuffer('logo.png', logoBuffer);
  pass.addBuffer('logo@2x.png', logoBuffer);

  // Strip PNG
  try {
    if (templateData.images.stripUrl) {
      let finalStripUrl = templateData.images.stripUrl;
      if (finalStripUrl.startsWith('/')) finalStripUrl = `${protocol}://${host}${finalStripUrl}`; 
      const stripRes = await fetch(finalStripUrl, { cache: 'no-store' });
      if (stripRes.ok) {
         const pngBuffer = await sharp(Buffer.from(await stripRes.arrayBuffer()))
           .resize(1125, 369, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
           .png().toBuffer();
         pass.addBuffer('strip.png', pngBuffer);
         pass.addBuffer('strip@2x.png', pngBuffer);
      }
    }
  } catch (e) { console.error("Erreur strip.png"); }
  
  return pass.getAsBuffer();
}