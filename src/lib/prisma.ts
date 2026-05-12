import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// 1. On récupère ton lien transactionnel pour l'application (Port 6543)
const connectionString = process.env.DATABASE_URL;

// 2. On crée le "Pool" de connexions natif
const pool = new Pool({ connectionString });

// 3. On branche l'adaptateur
const adapter = new PrismaPg(pool);

// 4. On initialise Prisma avec cet adaptateur (Optimisé pour Vercel)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, 
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;