import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import { prisma } from '@/lib/prisma';
import { getCardTemplateData } from '@/lib/wallet-templates';
import sharp from 'sharp'; // 👈 1. ON IMPORTE LA LIBRAIRIE MAGIQUE ICI

const FALLBACK_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s5Vn6QAAAAASUVORK5CYII=';
const FALLBACK_PIXEL_BUFFER = Buffer.from(FALLBACK_PIXEL_PNG_BASE64, 'base64');

// 👇 NOS VRAIS FICHIERS PNG PAR DÉFAUT 👇
const FALLBACK_LOGO_PATH = path.join(process.cwd(), 'public', 'assets', 'default-logo.png');
const FALLBACK_ICON_PATH = path.join(process.cwd(), 'public', 'assets', 'default-icon.png');

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
    
    // On charge le logo (distant ou local par défaut)
    const logoBuffer = await getMerchantLogoBuffer(templateData.images.logoUrl);
    
    // 👇 On charge l'icône obligatoire 👇
    let iconBuffer = FALLBACK_PIXEL_BUFFER;
    try {
      iconBuffer = await readFile(FALLBACK_ICON_PATH);
    } catch (e) {
      console.error("Fichier default-icon.png introuvable, utilisation du pixel de secours.");
    }

    const signerCert = requireEnv('APPLE_WALLET_CERT');
    const signerKey = requireEnv('APPLE_WALLET_KEY');
    const teamIdentifier = requireEnv('APPLE_TEAM_IDENTIFIER');
    const passTypeIdentifier = requireEnv('APPLE_PASS_TYPE_IDENTIFIER');
    
    // Sécurité: utiliser signerCert en fallback pour wwdr n'est pas idéal, mais passons si APPLE_WALLET_WWDR est bien défini.
    const wwdr = process.env.APPLE_WALLET_WWDR || signerCert;

    const passJson = {
      formatVersion: 1,
      passTypeIdentifier,
      teamIdentifier,
      serialNumber,
      organizationName: templateData.merchant.name,
      description: `${templateData.merchant.name} - Carte de fidelite`,
      logoText: templateData.merchant.name,
      foregroundColor: `rgb(${parseInt(templateData.colors.text.slice(1, 3), 16)}, ${parseInt(
        templateData.colors.text.slice(3, 5),
        16,
      )}, ${parseInt(templateData.colors.text.slice(5, 7), 16)})`,
      backgroundColor: `rgb(${parseInt(templateData.colors.background.slice(1, 3), 16)}, ${parseInt(
        templateData.colors.background.slice(3, 5),
        16,
      )}, ${parseInt(templateData.colors.background.slice(5, 7), 16)})`,
      labelColor: `rgb(${parseInt(templateData.colors.label.slice(1, 3), 16)}, ${parseInt(
        templateData.colors.label.slice(3, 5),
        16,
      )}, ${parseInt(templateData.colors.label.slice(5, 7), 16)})`,
      storeCard: {
        // En haut à droite (à côté du nom du client)
        primaryFields: [
          {
            key: 'customer',
            label: 'CLIENT',
            value: templateData.customer.firstName,
          },
        ],
        // ❌ ON SUPPRIME SECONDARYFIELDS ICI : Cela évite que le texte "0/10" s'écrive par-dessus tes tampons !
        secondaryFields: [], 
        
        // 👇 ON MET LES TEXTES TOUT EN BAS (Juste au-dessus du QR Code, là où il y a de la place) 👇
        auxiliaryFields: [
          {
            key: 'balance',
            label: templateData.loyalty.balanceLabel, // Ex: "TAMPONS"
            value: templateData.loyalty.progressText,  // Ex: "0 / 10"
          },
        ],
        backFields: [
          {
            key: 'email',
            label: 'Email',
            value: templateData.customer.email,
          },
          {
            key: 'walletId',
            label: 'Identifiant',
            value: templateData.customer.walletId,
          },
        ],
      },
      barcodes: [
        {
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
      {
        wwdr,
        signerCert,
        signerKey,
      },
    );

    // On injecte le logo au runtime
    pass.addBuffer('logo.png', logoBuffer);
    pass.addBuffer('logo@2x.png', logoBuffer);

    console.log("Tentative de téléchargement du stripUrl :", templateData.images.stripUrl);
    try {
      if (templateData.images.stripUrl) {
        let finalStripUrl = templateData.images.stripUrl;
        
        // Si l'URL est relative (commence par /), on reconstruit l'URL absolue intelligemment
        if (finalStripUrl.startsWith('/')) {
           const host = request.headers.get('host') || 'localhost:3000';
           const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
           finalStripUrl = `${protocol}://${host}${finalStripUrl}`; 
        }

        console.log("👉 URL finale utilisée pour le fetch :", finalStripUrl);

        const stripRes = await fetch(finalStripUrl, { cache: 'no-store' });
        
        if (!stripRes.ok) {
           console.error("❌ Erreur HTTP lors du fetch du strip :", stripRes.status, stripRes.statusText);
        } else {
           const stripArrayBuffer = await stripRes.arrayBuffer();
           const rawBuffer = Buffer.from(stripArrayBuffer);
           
           // 👇 2. ON CONVERTIT LE SVG EN VRAI PNG ICI 👇
           const pngBuffer = await sharp(rawBuffer).png().toBuffer();
           
           pass.addBuffer('strip.png', pngBuffer);
           pass.addBuffer('strip@2x.png', pngBuffer);
           console.log("✅ Image strip.png convertie en PNG et injectée avec succès !");
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