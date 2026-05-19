import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// On récupère la même clé secrète
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

// Les routes "ouvertes au public"
const publicRoutes = ['/', '/login', '/register', '/privacy', '/contact', '/assets'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. On laisse toujours passer les API, les images, et les routes publiques
    if (
        pathname.startsWith('/api') || 
        pathname.startsWith('/_next') || 
        publicRoutes.includes(pathname)
    ) {
        return NextResponse.next();
    }

    // 2. On fouille l'utilisateur pour trouver son badge (Cookie)
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // Pas de badge ? Direction la page de connexion !
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // 3. On passe le badge à la machine pour voir s'il n'est pas faux
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const role = payload.role as string;

        // 4. Règles de sécurité strictes (Le bon rôle pour la bonne page)
        if (pathname.startsWith('/founder') && role !== 'FOUNDER') {
            return NextResponse.redirect(new URL('/scanner', request.url));
        }

        if (pathname.startsWith('/dashboard') && role === 'EMPLOYEE') {
            return NextResponse.redirect(new URL('/scanner', request.url)); // Les employés n'ont pas de dashboard
        }

        // Si l'utilisateur a le droit d'être là, on ouvre la porte
        return NextResponse.next();

    } catch (error) {
        // Si le badge est expiré ou falsifié, on le détruit et on le vire au login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }
}

// Configuration pour dire à Next.js d'utiliser ce videur partout (sauf sur les fichiers statiques)
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};