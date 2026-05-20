import http2 from 'node:http2';
import { prisma } from '@/lib/prisma';

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