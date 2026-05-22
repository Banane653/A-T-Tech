import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// On récupère la clé secrète depuis le .env
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const identifier = body.identifier || body.email;
        const password = body.password;

        if (!identifier || !password) {
            return NextResponse.json({ error: "Identifiant et mot de passe requis" }, { status: 400 });
        }

        // 2. On cherche l'utilisateur par son Email OU par son Username
        const user = await prisma.merchantUser.findFirst({ 
            where: { 
                OR: [
                    { email: identifier },
                    { username: identifier.toLowerCase() } // Force la minuscule par sécurité
                ]
            } 
        });
        
        if (!user) {
            return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
        }

        // 2. On vérifie si le mot de passe correspond au mot de passe crypté
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
        }

        // 3. C'est le bon mot de passe ! On crée le Badge JWT
        const token = await new SignJWT({
            userId: user.id,
            role: user.role, // "FOUNDER", "ADMIN" ou "EMPLOYEE"
            companyId: user.companyId
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h') // Le client sera déconnecté après 24h
        .sign(SECRET_KEY);

        // 4. On prépare la réponse
        const response = NextResponse.json({
            success: true,
            role: user.role,
            message: "Connexion réussie"
        });

        // 5. On glisse le badge dans un Cookie ultra-sécurisé
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true, // Invisible pour le code Javascript côté client (Sécurité anti-hacker)
            secure: process.env.NODE_ENV === 'production', // Oblige le HTTPS en production
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 heures
            path: '/', // Le cookie est valable sur tout le site
        });

        return response;

    } catch (error) {
        console.error("Erreur API Login:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}