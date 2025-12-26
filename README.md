# Harmony Manager

Intranet de gestion pour garage automobile FiveM (Harmony Motors / Hayes Motors).

## Fonctionnalités

- **Authentification Discord** - Connexion sécurisée via Discord OAuth
- **Système de rôles** - 7 niveaux (Client, Recrue, Mécano Novice, Expérimenté, Chef d'équipe, Patron, Superadmin)
- **Recrutement** - Formulaire de candidature et gestion des candidatures
- **Fidélité** - Programme de points fidélité avec bonus
- **Facturation** - Création de factures avec services et collaborations
- **Statistiques** - Suivi du CA personnel et d'équipe avec objectifs hebdomadaires
- **Gestion Manager** - Recrutement, collaborations, paie & impôts
- **Administration** - Utilisateurs, services, véhicules, configuration

## Stack Technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : Auth.js (NextAuth v5) + Discord
- **UI** : TailwindCSS + shadcn/ui
- **Validation** : Zod
- **Notifications** : Sonner

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL
- Compte Discord Developer

### Configuration

1. Cloner le repo :
```bash
git clone https://github.com/gtolontop/harmony-manager.git
cd harmony-manager
```

2. Installer les dépendances :
```bash
npm install
```

3. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

4. Configurer les variables d'environnement dans `.env` :
   - `DATABASE_URL` : URL de connexion PostgreSQL
   - `AUTH_SECRET` : Clé secrète (générer avec `openssl rand -base64 32`)
   - `AUTH_DISCORD_ID` : Client ID Discord
   - `AUTH_DISCORD_SECRET` : Client Secret Discord

5. Créer l'application Discord :
   - Aller sur https://discord.com/developers/applications
   - Créer une nouvelle application
   - Aller dans OAuth2 > General
   - Copier Client ID et Client Secret
   - Ajouter l'URL de redirection : `http://localhost:3000/api/auth/callback/discord`

6. Initialiser la base de données :
```bash
npm run db:push
npm run db:seed
```

7. Lancer le serveur de développement :
```bash
npm run dev
```

L'application est accessible sur http://localhost:3000

## Scripts

- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run start` : Lancer la production
- `npm run db:push` : Synchroniser le schéma Prisma
- `npm run db:seed` : Peupler la base avec des données initiales
- `npm run db:studio` : Interface Prisma Studio

## Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Pages d'authentification
│   ├── (dashboard)/       # Pages protégées
│   │   ├── admin/         # Administration
│   │   ├── compta/        # Comptabilité
│   │   ├── fidelite/      # Fidélité
│   │   ├── manager/       # Gestion
│   │   ├── recrutement/   # Candidatures
│   │   └── stats/         # Statistiques
│   └── api/               # Routes API
├── components/            # Composants React
│   ├── layout/           # Layout (navbar, etc.)
│   └── ui/               # Composants UI (shadcn)
├── lib/                  # Utilitaires
│   ├── actions/          # Server Actions
│   ├── auth.ts           # Configuration Auth.js
│   ├── db.ts             # Client Prisma
│   └── rbac.ts           # Contrôle d'accès
└── types/                # Types TypeScript
```

## Rôles et permissions

| Rôle | Niveau | % Paie | Accès |
|------|--------|--------|-------|
| Client | 0 | - | Fidélité |
| Recrue | 1 | 20% | + Facturation, Stats |
| Mécano Novice | 2 | 25% | Idem |
| Expérimenté | 3 | 30% | + Historique |
| Chef d'équipe | 4 | 35% | + Manager |
| Patron | 5 | 40% | + Admin |
| Superadmin | 6 | 50% | Tous |

## Licence

Projet privé - Tous droits réservés.
