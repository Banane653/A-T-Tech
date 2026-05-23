import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Cardeo - La fidélité de demain",
  description: "Gérez vos cartes de fidélité directement dans Apple Wallet et Google Pay.",
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