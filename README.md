# Tetronix — Tetris‑like mobile (Expo, Skia, Reanimated) [en]

Tetronix is a Tetris‑like mobile game built to demonstrate strong command of modern React Native (Expo SDK 53, Reanimated 3, Skia 2) and performance‑oriented engineering.

## Why this project
- Deliver smooth, high‑refresh gameplay (120 fps) thanks to GPU rendering via Skia and UI‑thread animations via Reanimated.
- Showcase a reusable front→back integration (GitHub auth, leaderboard, replays) that anyone can plug into.

## Features
- Responsive gameplay
  - Move, rotate, hard‑drop, ghost piece, line clears, scoring and progressive levels.
  - Skia canvas (glow/blur effects, rounded cells) for a neon aesthetic.
- Replays
  - Watch your own games and other players’ games (reconstructed from timestamped actions).
- Competitive & social
  - GitHub authentication (via expo‑auth‑session), profile, animated leaderboard, statistics (score, level, lines, games).

## Tech stack
- React • React Native
- Rendering & animations: @shopify/react‑native‑skia • react‑native‑reanimated
- Auth & networking: expo‑auth‑session • axios (withCredentials)
- UI/UX: react‑native‑gesture‑handler, react‑native‑screens, react‑native‑safe‑area‑context, react‑native‑pager‑view, custom fonts (Neoneon, Quicksand)

## Use this frontend with your backend
This frontend is standalone and can be connected to any compatible backend. A reference backend is available on my GitHub: [Tetronix‑Backend](https://github.com/Petitzenkuzu/Tetronix-Backend).

Minimum API contract expected by the front (HTTP, JSON, session cookies):
- `GET /user` → current profile
- `GET /leaderboard` → top players
- `GET /game/stats` → current user stats
- `GET /game/stats/:name` → stats for a given player (to validate existence before replay)
- `GET /game/replay/:name` → replayable game data (includes timestamped `game_actions[]`)
- `GET /auth/github?code=...&redirect_uri=...` → establishes the session (status 200)
- `POST /auth/logout` → ends the session

Integration notes:
- GitHub OAuth: the front sends `code` + `redirect_uri` to the backend, which performs the token exchange with GitHub server‑side.

## Configuration
Environment variables (EXPO_PUBLIC_ prefix required by the front):

```
EXPO_PUBLIC_BACKEND_URL=https://your-backend.example.com
EXPO_PUBLIC_BACKEND_URL_WEBSOCKET=wss://your-backend.example.com
EXPO_PUBLIC_GITHUB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
```

Where to set them:
- `.env` at the project root (supported by Expo) or OS environment variables.

OAuth linking scheme: the app scheme is `tetronix` (see `app.json`). Ensure your GitHub app’s Authorization callback URL is compatible with `makeRedirectUri({ scheme: "tetronix" })`.

## Quick start
1) Install dependencies
```
npm install
```
2) Set environment variables (see Configuration) and run your reference backend.

3) Start the application
```
npm run start       # Expo (select Android/iOS/Web)
npm run android     # Build/Run Android
npm run ios         # Build/Run iOS (macOS required)
```

## Project structure (excerpt)
```
app/                 # Screens (Expo Router)
  _layout.tsx
  index.tsx          # Home: profile • home • leaderboard
  login.tsx          # GitHub auth
  game.tsx           # Main game (Skia + Reanimated)
  replayGame/[...].tsx  # Replay viewer
components/          # Reusable UI (NavBar, LeaderBoard, Profile...)
hooks/               # Hooks (API, timer, score)
utils/               # Game logic (placements, rotations, replays)
types/               # TS domain types
Constants/           # Dimensions, colors, grid, pieces
```

## Useful scripts
- `npm run start`: Expo dev server
- `npm run android` / `npm run ios`: native run

## Implementation notes
- Rendering: each board cell is a Skia `RoundedRect`, with fill/stroke styles and blur effects.
- Animations: Reanimated (`useSharedValue`, `useFrameCallback`) powers gravity, transitions, the countdown, and the replay player off the JS thread.
- Strong typing: all game entities (pieces, actions, grid) are typed to improve readability and safety.

## Roadmap (ideas)
- Haptics, SFX, extra game modes, themes, real‑time sync.

# Tetronix — Tetris‑like mobile (Expo, Skia, Reanimated) [fr]

Tetronix est un jeu mobile « Tetris‑like » conçu pour démontrer une maîtrise solide de l’écosystème React Native moderne (Expo SDK 53, Reanimated 3, Skia 2) et de pratiques de dev orientées performance.

## Pourquoi ce projet
- Mettre en avant une exécution fluide (120 fps) grâce au rendu GPU via Skia et aux animations thread‑UI via Reanimated.
- Montrer une intégration front→back (auth GitHub, leaderboard, replays) facilement réutilisable par n’importe qui.

## Fonctionnalités
- Gameplay complet et réactif
  - Déplacement, rotation, hard‑drop, « ghost piece », gestion des lignes, score et niveau progressif.
  - Canvas Skia (effets glow/blur, arrondis, rendu cellulaire) pour une esthétique néon.
- Replays
  - Lecture de vos parties et de celles d’autres joueurs (reconstruction à partir d’actions horodatées).
- Compétitif & social
  - Authentification GitHub (via expo‑auth‑session), profil, leaderboard animé, statistiques (score, niveau, lignes, parties).

## Stack technique
- React • React Native
- Rendu et animations: @shopify/react‑native‑skia • react‑native‑reanimated
- Auth & réseau: expo‑auth‑session • axios (withCredentials)
- UI/UX: react‑native‑gesture‑handler, react‑native‑screens, react‑native‑safe‑area‑context, react‑native‑pager‑view, polices custom (Neoneon, Quicksand)

## Utiliser ce frontend avec votre backend
Ce frontend est autonome et peut être branché à n’importe quel backend compatible. Un backend de référence est disponible sur mon GitHub: https://github.com/Petitzenkuzu/Tetronix-Backend.

Contrat minimal attendu par le front (HTTP, JSON, cookies de session):
- `GET /user` → profil courant
- `GET /leaderboard` → top joueurs
- `GET /game/stats` → stats de l’utilisateur courant
- `GET /game/stats/:name` → stats d’un joueur donné (pour vérifier l’existence avant replay)
- `GET /game/replay/:name` → données d’une partie rejouable (incluant `game_actions[]` horodatées)
- `GET /auth/github?code=...&redirect_uri=...` → établit la session (status 200)
- `POST /auth/logout` → termine la session

Remarques d’intégration:
- OAuth GitHub: le front transmet `code` + `redirect_uri` au backend, qui échange côté serveur le token auprès de GitHub.

## Configuration
Variables d’environnement (préfixe EXPO_PUBLIC_ requis pour le front):

```
EXPO_PUBLIC_BACKEND_URL=https://votre-backend.exemple.com
EXPO_PUBLIC_BACKEND_URL_WEBSOCKET=wss://votre-backend.exemple.com
EXPO_PUBLIC_GITHUB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
```

Où définir ces variables:
- Fichier `.env` à la racine du projet (supporté par Expo) ou variables d’environnement système.

Schéma d’URL pour OAuth (linking): le schéma appli est `tetronix` (voir `app.json`). Assurez‑vous que l’« Authorization callback URL » de votre app GitHub est compatible avec `makeRedirectUri({ scheme: "tetronix" })`.

## Démarrage rapide
1) Installer les dépendances
```
npm install
```
2) Renseigner les variables d’environnement (cf. Configuration) et lancer votre backend de référence.

3) Lancer l’application
```
npm run start       # Expo (choisir Android/iOS/Web)
npm run android     # Build/Run Android
npm run ios         # Build/Run iOS (macOS requis)
```

## Structure du projet (extrait)
```
app/                 # Écrans (Expo Router)
  _layout.tsx
  index.tsx          # Accueil: profil • home • leaderboard
  login.tsx          # Auth GitHub
  game.tsx           # Jeu principal (Skia + Reanimated)
  replayGame/[...].tsx  # Lecteur de replays
components/          # UI réutilisables (NavBar, LeaderBoard, Profile...)
hooks/               # Hooks (API, timer, score)
utils/               # Logique de jeu (placements, rotations, replays)
types/               # Types TS (domain)
Constants/           # Dimensions, couleurs, grille, pièces
```

## Scripts utiles
- `npm run start`: dev server Expo
- `npm run android` / `npm run ios`: exécution native

## Notes d’implémentation
- Rendu: chaque cellule du plateau est un `RoundedRect` Skia, avec styles fill/stroke et effets de blur.
- Animations: Reanimated (`useSharedValue`, `useFrameCallback`) pilote la gravité, les transitions, le compteur, et le lecteur de replays hors du thread JS.
- Typage fort: toutes les entités de jeu (pièces, actions, grille) sont typées pour éviter les erreurs et améliorer la lisibilité.

## Roadmap (idées)
- Haptics, SFX, modes de jeu supplémentaires, thèmes, synchronisation temps réel.
