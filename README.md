# Kollek

Application web pour cataloguer une collection de jeux vidéo rétro. On cherche un jeu via IGDB, on l'ajoute à sa collection, et on suit son cycle de vie : état, complétude, édition, nombre d'exemplaires, prix d'achat et de revente. Chaque utilisateur a sa propre collection, isolée par authentification.

Deux vues de consultation, grille et liste, avec filtres et tri. La direction visuelle n'est pas figée.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Supabase** : PostgreSQL, Auth (email/mot de passe), Storage (jaquettes)
- **IGDB** (API Twitch) pour la recherche de jeux, proxifiée par une route API pour garder le token côté serveur
- **TanStack Query** pour le cache de données client
- **Radix UI** + **Tailwind CSS v4** pour les composants
- **Zod** pour la validation
- **Framer Motion** pour les animations
- Déploiement sur **Vercel**

> Three.js / React Three Fiber / Spline sont présents dans les dépendances pour la shelf view 3D, reportée en post-MVP. Voir [docs/PRD.md](docs/PRD.md).

## Prérequis

- **Node.js 20+**
- Un projet **Supabase** (le tier gratuit suffit)
- Des identifiants **IGDB** (via un compte développeur Twitch)

## Installation

```bash
git clone https://github.com/AlexLeroyDeval/kollek.git
cd kollek
npm install
```

### 1. Variables d'environnement

Crée un fichier `.env.local` à la racine :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta-clef-anon
IGDB_CLIENT_ID=ton-client-id-twitch
IGDB_CLIENT_SECRET=ton-client-secret-twitch
```

L'URL et la clef anon se trouvent dans Supabase, section **Project Settings → API**.

Pour les identifiants IGDB : crée une application sur [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps). Le `Client ID` et le `Client Secret` générés servent à IGDB (qui passe par l'OAuth Twitch). Le token est récupéré et mis en cache côté serveur, jamais exposé au client.

### 2. Base de données

Dans Supabase, ouvre le **SQL Editor** et exécute [docs/schema.sql](docs/schema.sql). Ce script crée les tables, les policies RLS (collection privée par utilisateur, catalogue partagé) et le bucket Storage `covers`.

Le dossier [docs/migrations/](docs/migrations/) contient les changements incrémentaux appliqués après coup. `schema.sql` est déjà à jour avec toutes les migrations : pour une base neuve, il suffit de lancer `schema.sql`. Les fichiers de migration servent à mettre à niveau une base existante.

### 3. Hostname des images

Next/Image bloque les domaines non déclarés. Dans [next.config.ts](next.config.ts), remplace le hostname Supabase par celui de ton projet :

```ts
{ protocol: 'https', hostname: 'TON-PROJET.supabase.co' }
```

### 4. Lancer

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Tu seras redirigé vers `/login` : crée un compte avec « S'inscrire ».

> Par défaut, Supabase exige une confirmation par email. Pour développer sans cette étape, désactive **Confirm email** dans Supabase → **Authentication → Providers → Email**.

## Scripts

| Commande | Effet |
|----------|-------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run lint` | ESLint |

## Structure

```
src/
  app/
    api/collection/      # CRUD collection (route + [id])
    api/igdb/search/     # Recherche IGDB (fuzzy + titres alternatifs FR)
    login/               # Page d'authentification
    page.tsx             # Page principale
  components/
    collection/          # Grille, liste, dialogues d'ajout et de détail, filtres
    layout/              # Header
  lib/
    supabase/            # Clients client et serveur
    igdb/                # Client IGDB (token Twitch en cache)
    completion.ts        # Niveaux de complétude (codes + labels FR)
    condition.ts         # États (codes + labels FR)
    editions.ts          # Éditions par famille de plateforme
    fuzzy.ts             # Similarité pour la recherche tolérante aux fautes
  types/                 # Types partagés
docs/
  PRD.md                 # Spécification produit et roadmap
  schema.sql             # Schéma complet de la base
  migrations/            # Migrations incrémentales
```

## Contribuer

Les contributions sont bienvenues. Le flux habituel :

1. Crée une branche depuis `main` (`git checkout -b feat/ma-fonctionnalite`)
2. Code, en gardant `npx tsc --noEmit` et `npm run lint` au vert
3. Ouvre une Pull Request vers `main` avec une description de ce qui change et pourquoi

Quelques repères pour s'aligner avec l'existant :

- **Une lecture obligatoire** : ce dépôt tourne sur Next.js 16, qui s'écarte des versions plus anciennes sur plusieurs points. Avant d'écrire du code Next, lis le guide concerné dans `node_modules/next/dist/docs/`. C'est rappelé dans [AGENTS.md](AGENTS.md).
- **Données utilisateur** : tout changement de schéma passe par un fichier dans `docs/migrations/` (numéroté) **et** une mise à jour de `docs/schema.sql`.
- **Validation** : les entrées d'API sont validées avec Zod, côté serveur. La contrainte SQL reste le dernier rempart.
- **IGDB** : les appels passent toujours par la route API serveur, jamais directement depuis le client.
- **Langue** : l'interface et les commentaires sont en français.

Si tu touches au modèle ou à la roadmap, tiens [docs/PRD.md](docs/PRD.md) à jour.

## État du projet

MVP fonctionnel : recherche, ajout, édition, filtres, tri, vente, multi-utilisateur. La recherche IGDB gère les titres alternatifs (FR/régionaux) et tolère les fautes de frappe.

Prochaines pistes (détail dans le PRD) : prix marché via PriceCharting (v1.1), wishlist (v1.2), partage de collection et shelf view 3D (post-MVP).
