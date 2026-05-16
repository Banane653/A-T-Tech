import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

// Vérificateur pour s'assurer que c'est bien un ADMIN qui appelle l'API
async function getAdminData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        if (payload.role !== 'ADMIN') return null;
        return { userId: payload.userId as string, companyId: payload.companyId as string };
    } catch {
        return null;
    }
}

export async function GET() {
    const admin = await getAdminData();
    if (!admin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    try {
        const employees = await prisma.merchantUser.findMany({
            where: { companyId: admin.companyId, role: 'EMPLOYEE' },
            select: { id: true, name: true, email: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        
        // On récupère aussi le nom de la boite pour le dashboard
        const company = await prisma.company.findUnique({
            where: { id: admin.companyId },
            select: { id: true, systemType: true, name: true, _count: { select: { customers: true } } }
        });

        return NextResponse.json({ employees, company });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const admin = await getAdminData();
    if (!admin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    try {
        const { name, email, password } = await request.json();

        const existingUser = await prisma.merchantUser.findUnique({ where: { email } });
        if (existingUser) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newEmployee = await prisma.merchantUser.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'EMPLOYEE',
                companyId: admin.companyId // L'employé est lié à la même boîte que l'admin
            }
        });

        return NextResponse.json({ success: true, employee: { name: newEmployee.name, email: newEmployee.email } });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    // 1. On vérifie que c'est bien l'admin qui fait la demande
    const admin = await getAdminData();
    if (!admin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    try {
        // 2. On récupère l'ID envoyé dans l'URL (ex: /api/admin/employees?id=123)
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('id');

        if (!employeeId) {
            return NextResponse.json({ error: "ID de l'employé manquant" }, { status: 400 });
        }

        // 3. SÉCURITÉ : On vérifie que l'employé existe ET qu'il appartient bien à l'entreprise de cet admin
        const employee = await prisma.merchantUser.findUnique({
            where: { id: employeeId }
        });

        if (!employee || employee.companyId !== admin.companyId) {
            return NextResponse.json({ error: "Employé introuvable ou vous n'avez pas les droits" }, { status: 404 });
        }

        // 4. Suppression définitive
        await prisma.merchantUser.delete({
            where: { id: employeeId }
        });

        return NextResponse.json({ success: true, message: "Employé supprimé avec succès" });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression :", error);
        return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
    }
}