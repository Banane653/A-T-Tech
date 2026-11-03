import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Importations serveur de next-intl (Méthode universelle et sécurisée)
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. CONFIGURATION DU VIEWPORT (Bloque le zoom au clic, crucial pour une app de caisse)
export const viewport: Viewport = {
  themeColor: '#FF6E00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 2. CONFIGURATION METADATA (PWA & Apple Web App)
export const metadata: Metadata = {
  title: "Cardeo - La fidélité de demain",
  description: "Gérez vos cartes de fidélité directement dans Apple Wallet et Google Pay.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cardeo',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
};

// On n'utilise plus les "params" instables de Next.js ici
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  // next-intl va trouver la langue tout seul comme un grand
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}