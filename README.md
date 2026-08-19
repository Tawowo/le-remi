# 🂠 Le Rémi — Compteur de score intelligent

Application mobile-first (PWA) pour tenir le score du jeu de cartes **Le Rémi**.
Elle calcule tout automatiquement — Rémi sec, contre, égalités, arrondis, fin de
partie — et **raconte le résultat** pour éviter toute dispute autour de la table.

- **100 % local** : aucune inscription, aucun backend. Tout est stocké dans le
  `localStorage` du téléphone (préfixe `remi:`).
- **Installable** : PWA avec manifest, icônes et service worker (fonctionne
  hors-ligne, se garde sur l'écran d'accueil).
- **Moteur de score isolé et testé** : `src/lib/scoring.ts`, couvert par Vitest.

---

## 🎴 Comment jouer (dans l'app)

1. **Nouvelle partie** → saisissez les joueurs *dans le sens des aiguilles d'une
   montre*, en commençant par le premier donneur (2 à 6 joueurs). L'objectif est
   pré-rempli à `100 × nombre de joueurs`, modifiable.
2. À la fin de chaque manche, appuyez sur **Fin de manche** :
   - **Qui a posé ?** (un tap)
   - **Ses points restants ?** (clavier 0-10 ; le 0 = *Rémi sec*)
   - **Les points de chaque adversaire** (cartes isolées uniquement — brelans et
     suites valent 0)
3. L'app détecte le cas (victoire normale / Rémi sec / contre / égalité),
   affiche **le détail du calcul ligne par ligne**, puis met à jour le classement.
4. **Garde-fous** : « Corriger la dernière manche », historique consultable,
   sauvegarde continue, validation douce des saisies improbables.
5. À l'objectif atteint → **écran de victoire** (podium, stats, revanche).

La page **Règles** rappelle toutes les règles, illustrées par de vraies cartes
SVG. Elle est aussi accessible en cours de partie via l'icône `?`.

---

## 📜 Les règles formalisées (source de vérité du moteur)

- **Matériel** : 52 cartes, 2 à 6 joueurs. 10 cartes/joueur à 2, 7 à 3+.
- **Valeurs** : As = 1, 2→10 = valeur faciale, V/D/R = 10.
- **Combinaisons (0 point)** : brelan (3-4 cartes de même valeur) ou suite (3+
  cartes qui se suivent dans la même famille ; l'As en bas *ou* en haut, jamais à
  cheval).
- **Poser** : possible si la main hors combinaisons ≤ 10. La manche s'arrête.
- **Score normal** : le poseur marque ses points + ceux de tous les adversaires.
- **Rémi sec** (poser à 0) : bonus de `10 × nombre de joueurs`.
- **Contre** : si un adversaire a *strictement* moins que le poseur, le poseur
  perd `10 × nombre de joueurs` et le plus bas total rafle le pot.
- **Égalité au plus bas** : le pot est réparti à parts égales, **arrondi au
  supérieur** pour chacun (bonus Rémi sec en plus si les ex æquo sont à 0).
- **Fin de partie** : premier à `100 × nombre de joueurs` (réglable).

---

## 🏗️ Architecture

```
src/
  app/
    layout.tsx            # thème, PWA, service worker
    page.tsx              # accueil (logo animé + menu)
    nouvelle-partie/      # création de partie (joueurs, ordre, objectif)
    partie/               # écran de jeu : bandeau, classement, saisie, victoire
    historique/           # parties archivées + podiums
    regles/               # page règles illustrée (sommaire collant)
    globals.css           # thème « tapis de jeu », animations
  components/
    PlayingCard.tsx       # carte à jouer SVG maison (aucune image)
    RoundEntry.tsx        # flux de saisie de fin de manche (A → B → C → résultat)
    ResultReveal.tsx      # narration animée du résultat + détail du calcul
    RankingBoard.tsx      # classement en direct (réordonnancement FLIP)
    RoundHistory.tsx      # tableau par manche
    VictoryScreen.tsx     # podium + statistiques + revanche
    Keypad.tsx            # claviers géants (0-10 et numérique)
    Confetti / Odometer / Logo / ThemeToggle / RulesPanel ...
  lib/
    scoring.ts            # MOTEUR PUR (testé)   ← cœur du calcul
    scoring.test.ts       # tous les cas du §1 + cas vicieux
    game.ts               # partie, cumuls, stats, revanche
    game.test.ts          # rotation du donneur + déroulé
    rotation.ts           # donneur / joueur qui commence (sens horaire)
    storage.ts            # persistance localStorage (préfixe remi:)
    types.ts              # types du domaine
public/
  manifest.json  sw.js  icons/   # PWA
```

Le **moteur de score** (`scoring.ts`) est une fonction pure `scoreRound()` sans
effet de bord : mêmes entrées → mêmes sorties, ce qui la rend entièrement
testable et garantit un calcul reproductible.

---

## 🚀 Développement

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tests unitaires du moteur (Vitest)
npm run build      # build de production
```

Déploiement : **Vercel** (framework Next.js détecté via `vercel.json`).
Node ≥ 18.18 requis (`engines`).

---

## 🎨 Design

Univers « tapis de jeu chic » : feutrine verte profonde, cartes ivoire, doré
pour les moments de gloire, rouge profond pour le contre. Mode sombre par défaut,
clair disponible. Cibles tactiles ≥ 48 px, claviers géants au pouce, animations
en `transform`/`opacity` uniquement (60 fps, `prefers-reduced-motion` respecté).
