import { type Company, type Customer } from '@prisma/client';
import { getTemplateById } from '@/config/templates';

type CompanyWithWalletConfig = Pick<
  Company,
  'id' | 'name' | 'systemType' | 'primaryColor' | 'textColor' | 'logoUrl' | 'cardTemplate'
>;

type CustomerForWallet = Pick<Customer, 'id' | 'firstName' | 'email' | 'walletId' | 'points'>;

export type WalletTemplateData = {
  colors: {
    background: string;
    text: string;
    label: string;
  };
  qr: {
    value: string;
    scannerUrl: string;
  };
  images: {
    logoUrl: string | null;
    heroImageUrl: string | null;
    stripUrl: string | null;
  };
  loyalty: {
    systemType: 'STAMPS' | 'POINTS';
    points: number;
    progressText: string;
    balanceLabel: string;
    balanceValue: string;
  };
  merchant: {
    id: string;
    name: string;
  };
  customer: {
    id: string;
    firstName: string;
    email: string;
    walletId: string;
  };
};

const DEFAULT_BACKGROUND = '#000000';
const DEFAULT_TEXT = '#FFFFFF';
const DEFAULT_LABEL = '#D1D5DB';

function normalizeHexColor(input: string | null | undefined, fallback: string): string {
  if (!input || !input.trim()) return fallback;
  const raw = input.trim();

  if (/^#([0-9a-fA-F]{6})$/.test(raw)) {
    return raw.toUpperCase();
  }

  if (/^#([0-9a-fA-F]{3})$/.test(raw)) {
    const [, triplet] = raw.match(/^#([0-9a-fA-F]{3})$/) ?? [];
    if (!triplet) return fallback;
    return `#${triplet
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
      .toUpperCase()}`;
  }

  const rgbMatch = raw.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch.slice(1).map((value) => Math.min(255, Number(value)));
    return `#${[r, g, b]
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`;
  }

  return fallback;
}

function resolveBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function getCardTemplateData(
  merchant: CompanyWithWalletConfig,
  user: CustomerForWallet,
): WalletTemplateData {
  const baseUrl = resolveBaseUrl();
  const template = getTemplateById(merchant.cardTemplate);
  const colors = {
    background: normalizeHexColor(merchant.primaryColor, DEFAULT_BACKGROUND),
    text: normalizeHexColor(merchant.textColor, DEFAULT_TEXT),
    label: normalizeHexColor(merchant.textColor, DEFAULT_LABEL),
  };

  const scannerUrl = `${baseUrl}/scanner?userId=${encodeURIComponent(user.walletId)}&companyId=${encodeURIComponent(
    merchant.id,
  )}`;

  let heroImageUrl: string | null = null;
  if (merchant.systemType === 'STAMPS') {
    const shape = template.stampShape || 'star';
    heroImageUrl = baseUrl.startsWith('https')
      ? `${baseUrl}/api/images/stamps?count=${user.points}&color=${encodeURIComponent(
          colors.background,
        )}&shape=${shape}`
      : `https://placehold.co/600x280/${colors.background.replace('#', '')}/FFFFFF/png?text=${user.points}+${shape.toUpperCase()}`;
  } else if (template.backgroundImage) {
    heroImageUrl = `${baseUrl}${template.backgroundImage}`;
  }

  return {
    colors,
    qr: {
      value: user.walletId,
      scannerUrl,
    },
    images: {
      logoUrl: merchant.logoUrl,
      heroImageUrl,
      stripUrl: heroImageUrl,
    },
    loyalty: {
      systemType: merchant.systemType as 'STAMPS' | 'POINTS',
      points: user.points,
      progressText: merchant.systemType === 'STAMPS' ? `${user.points} / 10` : `${user.points} points`,
      balanceLabel: merchant.systemType === 'STAMPS' ? 'TAMPONS RÉCOLTÉS' : 'SOLDE FIDÉLITÉ',
      balanceValue: merchant.systemType === 'STAMPS' ? `${user.points} / 10` : `${user.points}`,
    },
    merchant: {
      id: merchant.id,
      name: merchant.name,
    },
    customer: {
      id: user.id,
      firstName: user.firstName,
      email: user.email,
      walletId: user.walletId,
    },
  };
}
