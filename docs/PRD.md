# Kollek — Product Requirements Document

**Version :** 0.2 — Draft  
**Auteur :** Alexandre  
**Date :** 24 juin 2026  
**Stack :** Next.js 15 · Supabase · Vercel · Spline · React Three Fiber

---

## 1. Problème

Gérer une collection de jeux rétro aujourd'hui, c'est jongler entre des feuilles Excel, RetroCollect et VGCollect. Aucun outil existant ne donne envie de l'ouvrir, et aucun ne traite correctement le cycle complet d'un jeu dans une collection : achat, état, completion, revente.

---

## 2. Produit

**Kollek** est une app web pour cataloguer sa collection de jeux rétro. L'interface s'inspire de Reelswap : les jeux s'affichent comme des objets 3D sur une étagère, avec la cover art comme texture. La forme du mesh varie selon la plateforme — cartouche NES/SNES/N64/Game Boy, boîte PS1/Mega Drive, etc.

Les modèles 3D sont créés dans **Spline** et intégrés via `@splinetool/react-spline`.

Usage initial : personnel (1 utilisateur, pas d'écran de login au MVP). L'architecture supporte le multi-utilisateur sans refonte (auth Supabase activée dès le MVP).

---

## 3. Roadmap

| Version | Contenu |
|---------|---------|
| **MVP** | Gestion de collection — recherche IGDB, ajout, état, completion, prix achat/vente, vues shelf/list/grid, filtres, tri |
| **v1.1** | Prix marché — PriceCharting + eBay FR, refresh automatique, valeur totale de collection |
| **v1.2** | Wishlist — priorité, budget max, alerte prix |
| **v2** | Multi-utilisateur, partage de collection, scan code-barres |

---

## 4. Périmètre MVP

### Recherche & ajout

- Recherche de jeux par titre via **IGDB** (on-demand, pas d'import bulk)
- Sélection dans les résultats IGDB → création de la fiche en base
- Cover art copiée dans **Supabase Storage** à l'ajout (pas de dépendance aux URLs IGDB)
- Un même jeu peut avoir plusieurs entrées dans la collection (ex : plusieurs éditions)
- Toutes les plateformes disponibles sur IGDB, sans filtre

### Fiche jeu

| Champ | Valeurs |
|-------|---------|
| **État** | Mint / Very Good / Good / Fair / Poor |
| **Completion** | Loose (cartouche seule) / CIB (boîte + notice + jeu) / Sealed (neuf sous blister) |
| **Prix d'achat** | Montant + date |
| **Statut vendu** | Oui / Non. Si oui : prix de vente + date de vente |
| **Notes** | Texte avec formatting minimal (Markdown basique) |

Les jeux vendus restent visibles dans la collection avec un badge **"Vendu"** et un filtre pour les masquer.

### Consultation de la collection

Trois vues disponibles, basculement permanent :

| Vue | Description | Technologie |
|-----|-------------|-------------|
| **Shelf view** (défaut) | Étagère 3D, mesh par plateforme. Overflow → scroll horizontal. Au focus (hover/clic) : Cover Flow à la Apple — le jeu avance, les voisins s'inclinent. | Spline + React Three Fiber |
| **Grid view** | Grille de covers 2D, dense, pour le browsing rapide. | CSS Grid + Next/Image |
| **List view** | Tableau, une ligne par jeu, toutes les métadonnées visibles sans clic. | Table HTML |
| **Detail view** (overlay) | Objet 3D interactif (drag pour rotation 360°). Métadonnées complètes + formulaire d'édition. | Spline + Framer Motion |

**Filtres** (cumulables) : plateforme · état · completion · statut vendu  
**Tri** : date d'ajout (défaut, plus récent en premier) · nom A→Z

---

## 5. User Stories MVP

| # | Story | Priorité |
|---|-------|----------|
| US-01 | Je tape un titre, je vois les résultats IGDB avec cover et plateforme, je sélectionne le bon jeu et il apparaît dans ma collection. | P0 |
| US-02 | Lors de l'ajout, je renseigne l'état, la completion et le prix d'achat. | P0 |
| US-03 | Je consulte ma collection en shelf view 3D — les boîtes sont alignées sur une étagère, la forme varie selon la plateforme. | P0 |
| US-04 | Je bascule entre shelf view, grid view et list view depuis un sélecteur permanent. | P0 |
| US-05 | Je filtre ma collection par plateforme, état ou completion. Les filtres sont cumulables. | P1 |
| US-06 | Je trie ma collection par date d'ajout ou par nom. | P1 |
| US-07 | Je marque un jeu comme vendu, je saisis le prix de vente. Le jeu reste visible avec un badge "Vendu". | P1 |
| US-08 | Je peux modifier la fiche d'un jeu à tout moment (état, completion, prix, notes). | P1 |
| US-09 | Je supprime un jeu de ma collection. | P2 |

---

## 6. Architecture technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | Next.js 15 (App Router) | UI, Server Components, API Routes |
| 3D | Spline + `@splinetool/react-spline` | Modèles par plateforme, shelf view |
| Animations | Framer Motion + `@react-spring/three` | Cover Flow, hover, transitions |
| UI primitives | Radix UI + Tailwind CSS | Composants accessibles, stylés custom |
| Validation | Zod | Données IGDB avant insertion |
| Cache client | TanStack Query | Fetching, cache, revalidation |
| Base de données | Supabase (PostgreSQL) | 6 tables MVP, RLS activé |
| Auth | Supabase Auth | Prêt pour multi-user (pas d'écran login au MVP) |
| Storage | Supabase Storage | Cover art des jeux |
| Deploy | Vercel | Frontend, variables d'environnement |

### Schéma de base de données

Voir [`schema_bd.mermaid`](./schema_bd.mermaid) pour le diagramme ER complet.

**6 tables actives au MVP :** `PLATFORM` · `GAME` · `GENRE` · `PUBLISHER` · `GAME_COMPANY` · `COLLECTION`

**2 tables créées mais vides au MVP** (évitent une refonte en v1.1/v1.2) : `WISHLIST` · `MARKET_PRICE`

La table `COLLECTION` concentre toutes les données propres à l'utilisateur. Les tables `PLATFORM`, `GAME`, `GENRE` et `PUBLISHER` exposent un champ `igdb_id` (INT, unique) pour éviter les doublons.

Les appels IGDB sont proxifiés via une Next.js API Route — le token Twitch ne quitte pas le serveur.

---

## 7. Design & UX

### Identité visuelle

| Paramètre | Valeur |
|-----------|--------|
| **Fond** | `#0A0A0A` — dark mode exclusif |
| **Accent** | Corail / orange doux (ex : `#FF7A5A`) — direction "pluto cosy/gaming" |
| **Typographie** | Sans-serif moderne — pas de pixel font |
| **Principe** | La cover art est le héros. Les composants UI s'effacent derrière. |

### Plateformes avec mesh Spline dédié (~12)

**Nintendo :** NES · SNES · Nintendo 64 · Game Boy · Game Boy Advance · Nintendo DS  
**Sony :** PlayStation · PlayStation 2 · PlayStation 3  
**Sega :** Mega Drive · Saturn · Dreamcast  

Toutes les autres plateformes utilisent une **boîte générique**.

---

## 8. Intégration API (MVP)

### IGDB (Twitch)

| Paramètre | Valeur |
|-----------|--------|
| Auth | OAuth2 Client Credentials — token côté serveur, refresh automatique |
| Base URL | `https://api.igdb.com/v4` |
| Endpoints | `/games` · `/covers` · `/platforms` · `/genres` · `/involved_companies` · `/companies` |
| Langage de requête | Apicalypse (body POST) |
| Usage | Search on-demand uniquement — pas d'import bulk |

PriceCharting et eBay FR sont hors scope MVP — intégration prévue en v1.1.

---

## 9. Hors scope MVP

- Prix marché (PriceCharting, eBay FR) — prévu v1.1
- Wishlist — prévue v1.2
- Multi-utilisateur et partage de collection — prévu v2
- Écran de login / authentification utilisateur
- Scan de code-barres (ajout via caméra smartphone)
- Import depuis RetroCollect ou VGCollect
- App mobile native
- Statistiques de collection (valeur totale, évolution dans le temps)

---

## 10. Questions ouvertes

| Question | Statut |
|----------|--------|
| Couleur accent exacte | Direction validée (corail `#FF7A5A`), valeur exacte à affiner avec un moodboard |
| Intégration Spline | Runtime `@splinetool/react-spline` retenu — arbitrage avec export GLTF/R3F à confirmer selon les besoins d'animation du Cover Flow |
| Domaine de production | Sous-domaine Vercel pour le MVP, domaine custom à définir ensuite |
