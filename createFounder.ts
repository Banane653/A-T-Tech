import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    // Choisis tes identifiants de Fondateur
    const email = "alexis.dchsn@gmail.com";
    const plainPassword = "Alexispashack2411";

    // Cryptage du mot de passe
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Création du compte dans la base de données
    const founder = await prisma.merchantUser.create({
        data: {
            email: email,
            password: hashedPassword,
            name: "Alexis (Fondateur)",
            role: "FOUNDER"
        }
    });

    console.log("👑 Compte FOUNDER créé avec succès :", founder.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    // Déconnexion propre
    await prisma.$disconnect();
  });