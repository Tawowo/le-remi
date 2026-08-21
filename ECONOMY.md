# 💰 ÉCONOMIE & PROGRESSION — Le Rémi

> **Monnaie 100 % virtuelle.** Aucun achat réel, nulle part, jamais. Le mot est
> **« pièces »** (jamais « argent »). C'est un jeu, pas un casino.

Tous les montants ci-dessous sont **centralisés** dans
[`src/lib/economy/config.ts`](src/lib/economy/config.ts) et ajustables en une
ligne. Les règles de calcul sont des fonctions **pures et testées**
(`src/lib/economy/progression.ts`, `profileStore.ts`) — voir
`npm test` (`economy.test.ts`, `profileStore.test.ts`).

## Solde de départ

| Élément | Valeur |
|---|---|
| Pièces de bienvenue | **500** |

## Bonus quotidien de connexion (série)

| Jour de série | 1 | 2 | 3 | 4 | 5 | 6 | 7+ |
|---|---|---|---|---|---|---|---|
| Pièces | 100 | 120 | 150 | 180 | 220 | 260 | **300** |

La série monte d'un cran chaque jour consécutif et **retombe à 1** si un jour
est manqué. Un seul bonus par 24 h (jour UTC).

## La roue quotidienne (1 tour gratuit / 24 h)

Probabilités **affichées à côté de la roue** — et réellement appliquées (RNG
honnête, vérifié sur **100 000 tirages** dans les tests).

| Segment | Probabilité |
|---|---|
| 50 pièces | 50 % |
| 100 pièces | 25 % |
| 200 pièces | 10 % |
| Boost XP ×2 (3 parties) | 5 % |
| 500 pièces | 4 % |
| Tour bonus | 3 % |
| 1 000 pièces | 2 % |
| **JACKPOT 5 000 pièces** | 1 % |

> Note : le cahier V3 listait des probabilités sommant à 80 %. Pour un total de
> 100 % honnête, le segment « 50 pièces » est porté à 50 % (le reste inchangé),
> et **les probabilités affichées sont exactement celles appliquées**.

## Les Tables (paliers d'enjeu)

| Table | Entrée | Victoire (solo vs bots) | En ligne (pot commun) | Bots |
|---|---|---|---|---|
| Découverte | 0 | +30 | — | facile |
| Bistrot | 100 | +150 | pot = entrée × joueurs | facile |
| Bronze | 500 | +800 | pot commun | moyen |
| Argent | 2 000 | +3 200 | pot commun, **2ᵉ remboursé** | moyen |
| Or | 10 000 | +16 000 | pot commun, 2ᵉ remboursé | difficile |
| Prestige | 50 000 | +80 000 | pot commun, 2ᵉ remboursé | difficile |

- **En ligne** : chaque joueur paie l'entrée → `pot = entrée × joueurs` ; le
  vainqueur emporte le pot. À partir d'Argent, le 2ᵉ récupère sa mise.
- **Hors ligne** : entrée débitée au lancement, gain fixe à la victoire.
- **Filet anti-faillite** : la **Découverte** (entrée 0, +30) est toujours
  jouable, et le bonus quotidien garantit qu'on n'est jamais bloqué.
- Table verrouillée si solde insuffisant (« il te manque X pièces »),
  confirmation avant de miser ; l'abandon en cours = mise perdue.

## XP, niveaux et récompenses

**Gains d'XP :**

| Action | XP |
|---|---|
| Manche jouée | +10 |
| Manche gagnée | +25 |
| Partie gagnée | +60 |
| Brelan posé | +5 |
| Suite ≥ 4 | +8 |
| Rémi sec | +40 |
| Contre infligé | +30 |
| Première partie du jour | +20 |
| Victoire en ligne (bonus) | +30 |
| Défi du jour | +50 |

**Courbe :** XP cumulée pour atteindre le niveau *N* = `round(100 × N^1.5)`
(niveau 2 ≈ 283, niveau 5 ≈ 1 118, niveau 10 ≈ 3 162). Niveau max **100**.

**Récompense à chaque niveau** (jamais de niveau vide) : `100 × niveau` pièces,
plus, aux paliers marquants, des cosmétiques/titres exclusifs (niv. 5 : dos
« As de cœur », 10 : tapis minuit, 15 : cadre doré, 20 : avatar légendaire,
25 : titre « Maître du Carré »). Des **Boosts XP ×2** (3 parties) sont
gagnables aux niveaux et à la roue.

## Boutique (cosmétiques, en pièces uniquement)

| Type | Exemples | Fourchette |
|---|---|---|
| Dos de cartes | classique (0), As de cœur (300), Royal (800), Doré (2 000) | 300–2 000 |
| Tapis | feutrine (0), bois (500), minuit (1 500), or (3 000) | 500–3 000 |
| Cadres d'avatar | argent (400), doré (1 500) | 400–1 500 |
| Pack d'avatars | 250 | 250 |

Débloquables **uniquement** avec des pièces gagnées en jouant. Aperçu en direct,
« équipé » par profil.

## Où ajuster

Tout est dans `src/lib/economy/config.ts` :
`STARTING_COINS`, `DAILY_BONUS_BY_STREAK`, `WHEEL_SEGMENTS`, `TABLES`,
`XP_EVENTS`, `xpToReachLevel`, `LEVEL_MILESTONES`, `SHOP`.
