import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import { prisma } from '@/lib/prisma';
import { getCardTemplateData } from '@/lib/wallet-templates';
import sharp from 'sharp';

const FALLBACK_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s5Vn6QAAAAASUVORK5CYII=';
const FALLBACK_PIXEL_BUFFER = Buffer.from(FALLBACK_PIXEL_PNG_BASE64, 'base64');

// 👇 NOS VRAIS FICHIERS PNG PAR DÉFAUT 👇
const FALLBACK_LOGO_PATH = path.join(process.cwd(), 'public', 'assets', 'default_logo.png');
const FALLBACK_ICON_PATH = path.join(process.cwd(), 'public', 'assets', 'default_icon.png');

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function getMerchantLogoBuffer(logoUrl: string | null): Promise<Buffer> {
  if (!logoUrl) {
    try {
      return await readFile(FALLBACK_LOGO_PATH);
    } catch {
      return FALLBACK_PIXEL_BUFFER;
    }
  }

  try {
    const res = await fetch(logoUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error('Fetch failed');

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    try {
      return await readFile(FALLBACK_LOGO_PATH);
    } catch {
      return FALLBACK_PIXEL_BUFFER;
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const companyId = searchParams.get('companyId');

    if (!name || !email || !companyId) {
      return new NextResponse("Nom, Email et ID de l'entreprise requis", { status: 400 });
    }
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    let customer = await prisma.customer.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!customer) {
      const walletId = `WLT-${Date.now()}`;
      customer = await prisma.customer.create({
        data: {
          firstName: name,
          email,
          walletId,
          points: 0,
          companyId,
        },
        include: { company: true },
      });
    }

    if (!customer.company) {
      return new NextResponse('Commerce introuvable', { status: 400 });
    }

    const templateData = getCardTemplateData(customer.company, customer);
    const serialNumber = `${templateData.customer.walletId}-${Date.now()}`;
    
    const logoBuffer = await getMerchantLogoBuffer(templateData.images.logoUrl);
    
    let iconBuffer = FALLBACK_PIXEL_BUFFER;
    try {
      iconBuffer = await readFile(FALLBACK_ICON_PATH);
    } catch (e) {
      console.error("Fichier default_icon.png introuvable...");
    }

    const signerCert = requireEnv('APPLE_WALLET_CERT');
    const signerKey = requireEnv('APPLE_WALLET_KEY');
    const teamIdentifier = requireEnv('APPLE_TEAM_IDENTIFIER');
    const passTypeIdentifier = requireEnv('APPLE_PASS_TYPE_IDENTIFIER');
    const wwdr = process.env.APPLE_WALLET_WWDR || signerCert;

    const passJson = {
      formatVersion: 1,
      passTypeIdentifier,
      teamIdentifier,
      serialNumber,
      webServiceURL: `${protocol}://${host}/api/wallet/apple`,
      authenticationToken: customer.walletId,
      // 👇 DISPOSITION PARFAITE DU HAUT 👇
      organizationName: "CARTE FIDÉLITÉ", // Titre en haut à gauche
      logoText: templateData.merchant.name,     // Logo "Goodly" en haut à gauche
      description: `${templateData.merchant.name} - Carte de fidelite`,
      foregroundColor: `rgb(${parseInt(templateData.colors.text.slice(1, 3), 16)}, ${parseInt(templateData.colors.text.slice(3, 5), 16)}, ${parseInt(templateData.colors.text.slice(5, 7), 16)})`,
      backgroundColor: `rgb(${parseInt(templateData.colors.background.slice(1, 3), 16)}, ${parseInt(templateData.colors.background.slice(3, 5), 16)}, ${parseInt(templateData.colors.background.slice(5, 7), 16)})`,
      labelColor: `rgb(${parseInt(templateData.colors.label.slice(1, 3), 16)}, ${parseInt(templateData.colors.label.slice(3, 5), 16)}, ${parseInt(templateData.colors.label.slice(5, 7), 16)})`,
      storeCard: {
        // 👇 CORRECTION : Si c'est POINTS on affiche le bloc, si c'est STAMPS on envoie un tableau vide [] pour que rien n'apparaisse 👇
        primaryFields: templateData.loyalty.systemType === "POINTS" ? [
          {
            key: "points",
            label: "POINTS",
            value: String(templateData.loyalty.points),
          }
        ] : [],
        
        secondaryFields: [], 
        
        auxiliaryFields: [
          {
            key: "member",
            label: "MEMBRE",
            value: templateData.customer.fullName,
          },
          {
            key: "level",
            label: "NIVEAU",
            value: `${templateData.loyalty.level} - ${templateData.loyalty.pointsToReward}`,
          }
        ],
        backFields: [
          { key: "email", label: "Email", value: templateData.customer.email },
          { key: "walletId", label: "Identifiant", value: templateData.customer.walletId }
        ],
      },
      barcodes: [
        {
          // 👇 ON REMPLACE LE BARCODE PAR UN QR CODE 👇
          format: 'PKBarcodeFormatQR',
          message: templateData.qr.value,
          messageEncoding: 'iso-8859-1',
          altText: templateData.customer.walletId,
        },
      ],
    };

    const pass = new PKPass(
      {
        'pass.json': Buffer.from(JSON.stringify(passJson)),
        'icon.png': iconBuffer,
        'icon@2x.png': iconBuffer,
      },
      { wwdr, signerCert, signerKey }
    );

    pass.addBuffer('logo.png', logoBuffer);
    pass.addBuffer('logo@2x.png', logoBuffer);

    // 👇 INJECTION DE LA GRILLE DE TAMPONS PARFAITE (En PNG Transparent) 👇
    try {
      if (templateData.images.stripUrl) {
        let finalStripUrl = templateData.images.stripUrl;
        if (finalStripUrl.startsWith('/')) {
           finalStripUrl = `${protocol}://${host}${finalStripUrl}`; 
        }

        console.log("👉 URL finale pour strip :", finalStripUrl);

        const stripRes = await fetch(finalStripUrl, { cache: 'no-store' });
        
        if (!stripRes.ok) {
           console.error("❌ Erreur fetch strip :", stripRes.status);
        } else {
           const stripArrayBuffer = await stripRes.arrayBuffer();
           const rawBuffer = Buffer.from(stripArrayBuffer);
           
           // 👇 Conversion PNG avec proportions parfaites 👇
           const pngBuffer = await sharp(rawBuffer)
             .resize(1125, 369, {
               fit: 'contain',
               background: { r: 0, g: 0, b: 0, alpha: 0 } // Fond transparent obligatoire
             })
             .png()
             .toBuffer();
           
           pass.addBuffer('strip.png', pngBuffer);
           pass.addBuffer('strip@2x.png', pngBuffer);
           console.log("✅ Image strip.png parfaite générée et injectée !");
        }
      }
    } catch (stripError) {
      console.error("❌ Le téléchargement du strip.png a crashé :", stripError);
    }
    
    const passBuffer = pass.getAsBuffer();

    return new Response(passBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': 'attachment; filename="loyalty.pkpass"',
      },
    });
  } catch (error) {
    console.error('Apple Wallet generation error:', error);
    return new NextResponse('Erreur serveur Apple Wallet', { status: 500 });
  }
}