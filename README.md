# 🂠 Le Rémi — Le jeu de cartes + compteur de score

Application mobile-first (PWA) autour du jeu de cartes **Le Rémi**. Trois façons
de jouer :

- 🤖 **Contre l'ordinateur** — vraie partie jouable contre 1 à 5 bots crédibles.
- 🌐 **En ligne par code** — jouer avec ses amis à distance (nécessite Supabase,
  voir le guide plus bas ; sinon l'écran affiche proprement « bientôt disponible »).
- 🃏 **Sur table** — le compteur de score intelligent d'origine, autour d'une
  vraie table de cartes.

Elle calcule tout automatiquement — Rémi sec, contre, égalités, arrondis, fin de
partie — et **raconte le résultat** pour éviter toute dispute.

- **Local d'abord** : aucune inscription. Tout est stocké dans le `localStorage`
  (préfixe `remi:`). Seul le mode en ligne utilise un serveur (Supabase).
- **Installable** : PWA (manifest, icônes, service worker, hors-ligne).
- **Moteurs purs et testés** : le décompte (`src/lib/scoring.ts`) et le jeu
  complet (`src/lib/game/`) sont couverts par Vitest (48 tests).
- **Statistiques par pseudo** tous modes confondus, avec badges.

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
    page.tsx              # accueil réorganisé (3 modes + stats + règles)
    jouer/                # config partie solo (nb de bots, profils)
    table/                # LA TABLE JOUABLE (solo vs bots)
    en-ligne/             # mode en ligne par code (dégradation gracieuse)
    nouvelle-partie/      # création partie « sur table » (compteur)
    partie/               # compteur : bandeau, classement, saisie, victoire
    historique/           # parties de table archivées
    stats/                # statistiques par pseudo, tous modes
    regles/               # page règles illustrée (sommaire collant)
  components/
    PlayingCard.tsx       # carte à jouer SVG maison (aucune image)
    table/
      TableGame.tsx       # contrôleur de la partie jouable (pilote les bots)
      HandFan.tsx         # ma main en éventail (combinaisons dorées)
      OpponentArc.tsx     # adversaires en arc (dos + tour + « réfléchit… »)
      RoundReveal.tsx     # décompte : mains révélées + calcul ligne à ligne
      PlayVictory.tsx     # podium + stats + revanche (mode jouable)
    RoundEntry / ResultReveal / RankingBoard / RulesPanel / ...
  lib/
    scoring.ts            # MOTEUR DE SCORE PUR (testé)  ← source de vérité
    game/                 # LE JEU JOUABLE (moteur pur, testé)
      cards.ts            #   deck 52, mélange Fisher-Yates seedé
      combinations.ts     #   meilleure décomposition (brelans/suites, DP)
      engine.ts           #   état + tour (pioche/défausse/pose), reshuffle
      bots.ts             #   3 profils + heuristiques (aucune triche)
      setup.ts            #   composition d'une partie solo
      *.test.ts           #   décompositions vicieuses, simulation complète
    table.ts              # mode compteur (cumuls, revanche)
    profiles.ts           # enregistrements + stats par pseudo + badges
    playStore.ts          # persistance de la partie jouable en cours
    online/               # config + client Supabase (mode en ligne)
    rotation.ts  storage.ts  types.ts
public/
  manifest.json  sw.js  icons/   # PWA
```

Les **moteurs** (`scoring.ts` et `src/lib/game/`) sont des fonctions pures : mêmes
entrées → mêmes sorties. `combinations.ts` calcule la **meilleure** décomposition
d'une main (celle qui minimise les points isolés) par programmation dynamique sur
les sous-ensembles, en gérant les cartes partageables entre un brelan et une suite
et l'As en haut ou en bas. Le jeu s'appuie sur `scoring.ts` pour le décompte :
une seule source de vérité.

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

## 🤖 Jouer contre l'ordinateur (solo)

Choisissez 1 à 5 adversaires et leur tempérament. Les bots ne voient **que**
leur main et la défausse (aucune triche), réfléchissent avec un délai variable, et
suivent trois profils :

- **Prudent** — pose dès qu'il peut (≤ 10), garde les petites cartes.
- **Équilibré** — pose autour de 7, ni trop tôt ni trop tard.
- **Audacieux** — retarde pour viser le Rémi sec, prend des risques.

Sur la table : piochez (talon ou défausse), vos combinaisons se surlignent en
doré automatiquement, le compteur « points isolés » est toujours affiché, et le
bouton **POSER** ne s'active qu'à ≤ 10 (doré « RÉMI SEC ! » à 0). Le décompte de
fin de manche révèle toutes les mains avec leurs combinaisons et le calcul détaillé.

## 📊 Statistiques par pseudo

Chaque pseudo utilisé sur l'appareil accumule ses stats **tous modes confondus**
(table / solo / en ligne) : parties, victoires, % de réussite, Rémi secs, contres
infligés/subis, adversaire favori, série en cours, plus des badges (« Roi du Rémi
sec », « Serial contreur », « L'increvable »…). Comparateur entre deux pseudos.

## 🌐 Mode en ligne — guide Supabase (pour Mathéo)

Le jeu en ligne par code a besoin d'un petit serveur temps réel **gratuit**
(Supabase). Sans lui, l'écran « Jouer en ligne » affiche proprement « bientôt
disponible » et **tout le reste de l'app fonctionne** (jamais de plantage).

Pour l'activer, **2 minutes**, aucune donnée sensible (pas de comptes, seulement
des pseudos) :

1. Aller sur **supabase.com**, créer un compte, puis **New project** (offre
   gratuite ; choisir une région proche, ex. Paris).
2. Dans le projet : **Project Settings → API**. Copier deux valeurs :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (clé publique) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Dans **Vercel** (projet le-remi) : **Settings → Environment Variables**,
   ajouter ces deux variables (Production + Preview), puis **redéployer**.

Ce sont les **seules** clés nécessaires. Au prochain chargement, le mode en ligne
détecte la configuration et s'active tout seul (`isOnlineConfigured()`).

> État : l'infrastructure (détection de config, client Supabase, écran create/join
> par code) est en place et dégrade proprement sans clés. La synchronisation
> temps réel de partie (salon d'attente Realtime + autorité de l'hôte) se branche
> sur ce socle une fois le projet Supabase fourni — c'est le prochain jalon, à
> vérifier en conditions réelles à deux appareils.

---

## 🎨 Design

Univers « tapis de jeu chic » : feutrine verte profonde, cartes ivoire, doré
pour les moments de gloire, rouge profond pour le contre. Mode sombre par défaut,
clair disponible. Cibles tactiles ≥ 48 px, claviers géants au pouce, animations
en `transform`/`opacity` uniquement (60 fps, `prefers-reduced-motion` respecté).
