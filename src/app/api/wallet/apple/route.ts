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
    try { return await readFile(FALLBACK_LOGO_PATH); } catch { return FALLBACK_PIXEL_BUFFER; }
  }
  try {
    const res = await fetch(logoUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error('Fetch failed');
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    try { return await readFile(FALLBACK_LOGO_PATH); } catch { return FALLBACK_PIXEL_BUFFER; }
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
      include: { company: { include: { locations: true } } },
    });

    // 👇 RATTRAPAGE DES ANCIENS CLIENTS (Qui n'ont pas de code 5 chiffres) 👇
    if (customer && !customer.shortCode) {
      let newShortCode = '';
      let isUnique = false;
      while (!isUnique) {
        newShortCode = Math.floor(10000 + Math.random() * 90000).toString();
        const existing = await prisma.customer.findFirst({
          where: { companyId, shortCode: newShortCode }
        });
        if (!existing) isUnique = true;
      }
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { shortCode: newShortCode },
        include: { company: { include: { locations: true } } }
      });
    }

    // 👇 CRÉATION DES NOUVEAUX CLIENTS AVEC LE CODE À 5 CHIFFRES 👇
    if (!customer) {
      const walletId = `WLT-${Date.now()}`;
      
      let newShortCode = '';
      let isUnique = false;
      while (!isUnique) {
        newShortCode = Math.floor(10000 + Math.random() * 90000).toString();
        const existing = await prisma.customer.findFirst({
          where: { companyId, shortCode: newShortCode }
        });
        if (!existing) isUnique = true;
      }

      customer = await prisma.customer.create({
        data: {
          firstName: name,
          email,
          walletId,
          shortCode: newShortCode,
          points: 0,
          companyId,
        },
        include: { company: { include: { locations: true } } },
      });
    }

    if (!customer.company) {
      return new NextResponse('Commerce introuvable', { status: 400 });
    }

    const templateData = getCardTemplateData(customer.company, customer);
    
    const latestCampaign = await prisma.marketingCampaign.findFirst({
      where: { companyId: customer.companyId! },
      orderBy: { createdAt: 'desc' }
    });

    const marketingTitle = latestCampaign ? latestCampaign.title : "Dernière offre";
    const marketingMessage = latestCampaign ? latestCampaign.message : "Gagnez des points à chaque visite !";
    const serialNumber = templateData.customer.walletId;
    
    const logoBuffer = await getMerchantLogoBuffer(templateData.images.logoUrl);
    
    let iconBuffer: any = FALLBACK_PIXEL_BUFFER;
    try {
      iconBuffer = await sharp(logoBuffer)
        .resize(100, 100, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } 
        })
        .png()
        .toBuffer();
    } catch (e) {
      try { iconBuffer = await readFile(FALLBACK_ICON_PATH); } catch (err) {}
    }

    const signerCert = requireEnv('APPLE_WALLET_CERT');
    const signerKey = requireEnv('APPLE_WALLET_KEY');
    const teamIdentifier = requireEnv('APPLE_TEAM_IDENTIFIER');
    const passTypeIdentifier = requireEnv('APPLE_PASS_TYPE_IDENTIFIER');
    const wwdr = process.env.APPLE_WALLET_WWDR || signerCert;

    const passJson: any = {
      formatVersion: 1,
      passTypeIdentifier,
      teamIdentifier,
      serialNumber,
      webServiceURL: `${protocol}://${host}/api/wallet/apple`,
      authenticationToken: customer.walletId,
      groupingIdentifier: companyId,

      // 👇 GÉOLOCALISATION MULTIPLE (GPS Marketing) 👇
      ...(customer.company.locations && customer.company.locations.length > 0 ? {
        locations: customer.company.locations.slice(0, 10).map((loc: any) => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          relevantText: loc.proximityText || "Vous êtes proche ! Venez nous rendre visite."
        }))
      } : {}),

      organizationName: templateData.merchant.name, 
      logoText: templateData.merchant.name,     
      description: `${templateData.merchant.name} - Carte de fidelite`,
      foregroundColor: `rgb(${parseInt(templateData.colors.text.slice(1, 3), 16)}, ${parseInt(templateData.colors.text.slice(3, 5), 16)}, ${parseInt(templateData.colors.text.slice(5, 7), 16)})`,
      backgroundColor: `rgb(${parseInt(templateData.colors.background.slice(1, 3), 16)}, ${parseInt(templateData.colors.background.slice(3, 5), 16)}, ${parseInt(templateData.colors.background.slice(5, 7), 16)})`,
      labelColor: `rgb(${parseInt(templateData.colors.label.slice(1, 3), 16)}, ${parseInt(templateData.colors.label.slice(3, 5), 16)}, ${parseInt(templateData.colors.label.slice(5, 7), 16)})`,
      storeCard: {
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
          { key: "walletId", label: "Identifiant", value: templateData.customer.walletId },
          { key: "marketingMessage", label: marketingTitle, value: marketingMessage, changeMessage: "%@" }
        ],
      },
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: templateData.qr.value, // (Le QR Code scanne toujours le long ID)
          messageEncoding: 'iso-8859-1',
          // 👇 LA LIGNE QUI FAISAIT DÉFAUT : AFFICHER LE CODE COURT SOUS LE QR 👇
          altText: customer.shortCode ? `CODE: ${customer.shortCode}` : templateData.customer.walletId,
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

    try {
      if (templateData.images.stripUrl) {
        let finalStripUrl = templateData.images.stripUrl;
        if (finalStripUrl.startsWith('/')) {
           finalStripUrl = `${protocol}://${host}${finalStripUrl}`; 
        }
        const stripRes = await fetch(finalStripUrl, { cache: 'no-store' });
        if (stripRes.ok) {
           const stripArrayBuffer = await stripRes.arrayBuffer();
           const rawBuffer = Buffer.from(stripArrayBuffer);
           const pngBuffer = await sharp(rawBuffer)
             .resize(1125, 369, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
             .png()
             .toBuffer();
           pass.addBuffer('strip.png', pngBuffer);
           pass.addBuffer('strip@2x.png', pngBuffer);
        }
      }
    } catch (stripError) {
      console.error("❌ Le téléchargement du strip a crashé :", stripError);
    }
    
    const passBuffer = pass.getAsBuffer();

    return new Response(passBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': 'attachment; filename="loyalty.pkpass"',
        'Last-Modified': new Date().toUTCString()
      },
    });
  } catch (error) {
    console.error('Apple Wallet generation error:', error);
    return new NextResponse('Erreur serveur Apple Wallet', { status: 500 });
  }
}