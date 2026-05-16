import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

export type AuthPayload = {
    userId: string;
    role: string;
    companyId: string;
};

export async function getAuthPayload(): Promise<AuthPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return {
            userId: payload.userId as string,
            role: payload.role as string,
            companyId: payload.companyId as string,
        };
    } catch {
        return null;
    }
}

export async function getAdminAuth(): Promise<AuthPayload | null> {
    const auth = await getAuthPayload();
    if (!auth || auth.role !== 'ADMIN') return null;
    return auth;
}

export async function getScannerAuth(): Promise<AuthPayload | null> {
    const auth = await getAuthPayload();
    if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'EMPLOYEE')) return null;
    return auth;
}

export async function verifyFounder(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload.role === 'FOUNDER';
    } catch {
        return false;
    }
}
