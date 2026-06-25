# Kollek — Product Requirements Document

**Version :** 0.3  
**Auteur :** Alexandre  
**Date :** 25 juin 2026  
**Stack :** Next.js 16 · React 19 · Supabase · Vercel · Spline · React Three Fiber

---

## 1. Problème

Gérer une collection de jeux rétro aujourd'hui, c'est jongler entre des feuilles Excel, RetroCollect et VGCollect. Aucun outil existant ne donne envie de l'ouvrir, et aucun ne traite correctement le cycle complet d'un jeu dans une collection : achat, état, completion, revente.

---

## 2. Produit

**Kollek** est une app web pour cataloguer sa collection de jeux rétro. L'interface s'inspire de Reelswap : les jeux s'affichent comme des objets 3D sur une étagère, avec la cover art comme texture. La forme du mesh varie selon la plateforme — cartouche NES/SNES/N64/Game Boy, boîte PS1/Mega Drive, etc.

Les modèles 3D sont créés dans **Spline** et intégrés via `@splinetool/react-spline`.

Usage initial : personnel. L'auth Supabase (email/mot de passe) est livrée au MVP : chaque utilisateur a sa propre collection, isolée par RLS. Le partage de collection reste prévu pour v2.

---

## 3. Roadmap

| Version | Contenu |
|---------|---------|
| **MVP** | Gestion de collection : recherche IGDB, ajout, état, completion, édition par copie, prix achat/vente, **vues grid/list**, filtres, tri, **auth email/mot de passe + collection par utilisateur**, polish UI/UX |
| **v1.1** | Prix marché : PriceCharting + eBay FR, refresh automatique, valeur totale de collection |
| **v1.2** | Wishlist : priorité, budget max, alerte prix |
| **post-MVP** | **Shelf view 3D** (Spline + Cover Flow), descopée du MVP le 2026-06-24 pour livrer plus vite ; reste l'identité visuelle cible |
| **v2** | Partage de collection, vitrine publique (favoris/à vendre), scan code-barres |

> **Note de scope (2026-06-24)** : la shelf view 3D, initialement pièce maîtresse du MVP, est reportée en post-MVP. Le MVP livre les vues **grid** et **list**. La shelf 3D reste l'ambition produit mais n'est plus bloquante pour une première version utilisable.

> **Note de scope (2026-06-25)** : l'auth Supabase et les collections par utilisateur, initialement listées en v2, ont été livrées dès le MVP (commit `c199f4c`). Voir §11 pour les décisions postérieures au draft initial.

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
| **État** | Comme neuf (Mint) / Très bon / Bon / Moyen / Mauvais. Codes stables en base, labels FR affichés. |
| **Completion** | 8 niveaux : Vrac (`loose`) / Complet en boîte (`cib`) / Boîte + Jeu / Boîte + Notice / Jeu + Notice / Notice seule / Boîte seule / Neuf sous blister (`sealed`). Codes stables en base, labels FR affichés. |
| **Édition** | Texte libre par copie (ex : « Platinum », « Player's Choice », réédition). Suggestions filtrées par famille de plateforme. |
| **Exemplaires** | Entier ≥ 1, défaut 1. Nombre de copies identiques pour cette entrée. |
| **Prix d'achat** | Montant + date |
| **Statut vendu** | Oui / Non. Si oui : prix de vente + date de vente |
| **Notes** | Texte avec formatting minimal (Markdown basique) |

Les jeux vendus restent visibles dans la collection avec un badge **"Vendu"** et un filtre pour les masquer.

### Consultation de la collection

Vues livrées au MVP, basculement permanent :

| Vue | Description | Technologie |
|-----|-------------|-------------|
| **Grid view** (défaut) | Grille de covers 2D, dense, pour le browsing rapide. | CSS Grid + Next/Image |
| **List view** | Tableau, une ligne par jeu, toutes les métadonnées visibles sans clic. | Table HTML |
| **Detail view** (overlay) | Métadonnées complètes + formulaire d'édition. | Radix Dialog + Framer Motion |

La **Shelf view 3D** (étagère, mesh par plateforme, Cover Flow au focus) est descopée en post-MVP. La rotation 360° de l'objet 3D dans la detail view en dépend, donc elle suit le même report.

**Filtres** (cumulables) : plateforme · état · completion · statut vendu  
**Tri** : date d'ajout (défaut, plus récent en premier) · nom A→Z

---

## 5. User Stories MVP

| # | Story | Priorité |
|---|-------|----------|
| US-00 | Je me crée un compte et je me connecte par email/mot de passe ; je ne vois que ma collection. | P0 |
| US-01 | Je tape un titre, je vois les résultats IGDB avec cover et plateforme, je sélectionne le bon jeu et il apparaît dans ma collection. | P0 |
| US-02 | Lors de l'ajout, je renseigne l'état, la completion, l'édition et le prix d'achat. | P0 |
| US-04 | Je bascule entre grid view et list view depuis un sélecteur permanent. | P0 |
| US-05 | Je filtre ma collection par plateforme, état ou completion. Les filtres sont cumulables. | P1 |
| US-06 | Je trie ma collection par date d'ajout ou par nom. | P1 |
| US-07 | Je marque un jeu comme vendu, je saisis le prix de vente. Le jeu reste visible avec un badge "Vendu". | P1 |
| US-08 | Je peux modifier la fiche d'un jeu à tout moment (état, completion, édition, prix, notes). | P1 |
| US-09 | Je supprime un jeu de ma collection. | P2 |
| US-03 | Je consulte ma collection en shelf view 3D : les boîtes sont alignées sur une étagère, la forme varie selon la plateforme. | post-MVP |

---

## 6. Architecture technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | Next.js 16 + React 19 (App Router) | UI, Server Components, API Routes |
| 3D | Spline + `@splinetool/react-spline` | Modèles par plateforme, shelf view |
| Animations | Framer Motion + `@react-spring/three` | Cover Flow, hover, transitions |
| UI primitives | Radix UI + Tailwind CSS | Composants accessibles, stylés custom |
| Validation | Zod | Données IGDB avant insertion |
| Cache client | TanStack Query | Fetching, cache, revalidation |
| Base de données | Supabase (PostgreSQL) | 6 tables MVP, RLS activé |
| Auth | Supabase Auth (email/mot de passe) | Login `/login` + middleware de protection, collection isolée par utilisateur (RLS) |
| Storage | Supabase Storage | Cover art des jeux |
| Deploy | Vercel | Frontend, variables d'environnement |

### Schéma de base de données

Voir [`schema_bd.mermaid`](./schema_bd.mermaid) pour le diagramme ER complet.

**6 tables actives au MVP :** `PLATFORM` · `GAME` · `GENRE` · `PUBLISHER` · `GAME_COMPANY` · `COLLECTION`

**2 tables créées mais vides au MVP** (évitent une refonte en v1.1/v1.2) : `WISHLIST` · `MARKET_PRICE`

La table `COLLECTION` concentre toutes les données propres à l'utilisateur. Depuis la migration `003`, `COLLECTION` et `WISHLIST` portent une colonne `user_id` (default `auth.uid()`) : chacun ne voit et ne modifie que ses lignes (policy RLS `own collection`). Le catalogue (`PLATFORM`, `GAME`, `GENRE`, `PUBLISHER`, `GAME_COMPANY`) reste partagé entre utilisateurs connectés. Les tables `PLATFORM`, `GAME`, `GENRE` et `PUBLISHER` exposent un champ `igdb_id` (INT, unique) pour éviter les doublons.

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

- Prix marché (PriceCharting, eBay FR) : prévu v1.1
- Wishlist : prévue v1.2
- Partage de collection et vitrine publique (favoris/à vendre) : prévu v2
- Shelf view 3D : reportée post-MVP (voir §3)
- Scan de code-barres (ajout via caméra smartphone)
- Import depuis RetroCollect ou VGCollect
- App mobile native
- Statistiques de collection (valeur totale, évolution dans le temps)

> L'auth utilisateur, initialement listée ici, est désormais livrée au MVP.

---

## 10. Questions ouvertes

| Question | Statut |
|----------|--------|
| Couleur accent exacte | Direction validée (corail `#FF7A5A`), valeur exacte à affiner avec un moodboard |
| Intégration Spline | Runtime `@splinetool/react-spline` retenu — arbitrage avec export GLTF/R3F à confirmer selon les besoins d'animation du Cover Flow |
| Domaine de production | Sous-domaine Vercel pour le MVP, domaine custom à définir ensuite |

---

## 11. Décisions postérieures au draft initial

Décisions prises pendant le développement, qui n'étaient pas dans le draft 0.1/0.2.

| Date | Décision | Raison |
|------|----------|--------|
| 2026-06-24 | Shelf view 3D descopée en post-MVP | Livrer une première version utilisable plus vite ; grid/list suffisent pour cataloguer. |
| 2026-06-24 | Completion passée de 3 à 8 niveaux | « Loose / CIB / Sealed » trop grossier pour le rétro : un jeu peut être boîte+jeu sans notice, notice seule, etc. Codes stables en base, labels FR. |
| — | Champ `edition` par copie | Distinguer rééditions et variantes (Platinum, Player's Choice…) d'un même jeu. Suggestions filtrées par famille de plateforme. |
| 2026-06-25 | Auth email/mot de passe + collection par utilisateur livrée au MVP | L'archi Supabase la rendait peu coûteuse ; évite une migration de données plus tard. |
| — | Estimation de revente Vinted abandonnée | Prototype scrappé : rate-limiting agressif, libs JS mortes, valeur faible pour le coût. |
| — | PriceCharting reporté en v1.1 | Source payante. Sert aussi de piste pour les jaquettes FR/PAL absentes d'IGDB. |
| — | Vitrine publique (favoris / à vendre) | Idée pour v2, une fois le partage de collection en place. |
