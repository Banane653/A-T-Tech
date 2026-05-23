import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import createIntlMiddleware from 'next-intl/middleware';

// 1. Configuration du routeur de langues (next-intl)
const intlMiddleware = createIntlMiddleware({
    locales: ['fr', 'en', 'nl'],
    defaultLocale: 'fr'
});

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

// J'ai ajouté les nouvelles pages (mot de passe oublié et légal) à tes routes publiques
const publicRoutes = [
    '/', '/login', '/register', '/contact', 
    '/forgot-password', '/reset-password', 
    '/legal/confidentialite', '/legal/cgv'
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 2. On laisse toujours passer les API, les images, etc.
    if (
        pathname.startsWith('/api') || 
        pathname.startsWith('/_next') || 
        pathname.startsWith('/assets') ||
        pathname.startsWith('/templates') ||
        pathname.startsWith('/legal')
    ) {
        return NextResponse.next();
    }

    // 3. ASTUCE : On enlève la langue de l'URL pour vérifier nos règles de sécurité
    // Ex: "/fr/login" devient "/login"
    let pathnameWithoutLocale = pathname.replace(/^\/(fr|en|nl)(\/|$)/, '/');
    // Petit nettoyage pour éviter un slash final en trop (ex: /login/ devient /login)
    if (pathnameWithoutLocale !== '/' && pathnameWithoutLocale.endsWith('/')) {
        pathnameWithoutLocale = pathnameWithoutLocale.slice(0, -1);
    }

    // 4. Est-ce une route publique ?
    if (publicRoutes.includes(pathnameWithoutLocale)) {
        // C'est public ! On laisse next-intl ajouter la langue (/fr) et afficher la page
        return intlMiddleware(request);
    }

    // --- 5. ZONE SÉCURISÉE : On fouille l'utilisateur ---
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // Pas de badge ? Direction /login. (next-intl rajoutera le /fr automatiquement après !)
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const role = payload.role as string;

        // Règles de sécurité strictes sur l'URL "nettoyée"
        if (pathnameWithoutLocale.startsWith('/founder') && role !== 'FOUNDER') {
            return NextResponse.redirect(new URL('/scanner', request.url));
        }

        if (pathnameWithoutLocale.startsWith('/dashboard') && role === 'EMPLOYEE') {
            return NextResponse.redirect(new URL('/scanner', request.url));
        }

        // Tout est bon, l'utilisateur a le droit d'être là. 
        // On passe le relais à next-intl pour afficher la bonne langue !
        return intlMiddleware(request);

    } catch (error) {
        // Badge expiré ou falsifié
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }
}

// 6. Configuration du Matcher pour next-intl
export const config = {
    // On applique le middleware partout sauf sur les fichiers statiques ou API
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};