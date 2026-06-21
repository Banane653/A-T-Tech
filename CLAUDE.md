@AGENTS.md

# Contexte du Projet : Cardeo
Ceci est un SaaS B2B2C de création de cartes de fidélité numériques (Google Wallet) en marque blanche pour les commerçants.

## Stack Technique
- Framework : Next.js 14+ (App Router uniquement, dossier `src/app/`)
- Base de données : PostgreSQL hébergé sur Supabase
- ORM : Prisma
- Styling : Tailwind CSS (pas de librairie UI complexe, raw Tailwind)
- Langage : TypeScript (Strict)

## Règles d'Architecture Strictes (À LIRE AVANT DE CODER)

1. **Séparation des Responsabilités (Le Cerveau et le Messager)**
   - Le "Cerveau" : Les routes API (`src/app/api/.../route.ts`) gèrent toute la logique mathématique (calcul des points, remises à zéro, création de transactions).
   - Le "Messager" : Le fichier `src/services/googleWallet.service.ts` s'occupe UNIQUEMENT de formater les données pour l'API Google. **NE MODIFIE JAMAIS ce fichier** sans l'autorisation explicite de l'utilisateur.

2. **Le Moteur de Thèmes (Theme Engine)**
   - Les designs des cartes sont pilotés par le catalogue centralisé dans `src/config/templates.ts`.
   - Il existe 2 types de systèmes : `STAMPS` (Tampons) et `POINTS` (Points classiques).
   - Toute nouvelle forme visuelle doit être ajoutée dans `templates.ts` et gérée dynamiquement.

3. **Le Système de Récompenses**
   - Le solde d'un client change via 3 actions : `EARN` (gagner), `SPEND` (dépenser des points pour un Reward), `RESET` (remise à 0 d'une carte à tampons complétée).
   - CHAQUE modification de solde doit générer une entrée dans le modèle `Transaction` de Prisma pour l'historique du gérant.

## Conventions de Code
- Préférer les composants fonctionnels React avec des Hooks.
- Garder les composants clients (`'use client';`) le plus bas possible dans l'arbre pour maximiser le Server-Side Rendering.
- Utiliser des routes API RESTful avec des méthodes standard (GET, POST, PATCH, DELETE).
- Ne jamais supprimer de code existant sans analyser ses dépendances. En cas de doute, demande avant de supprimer.
