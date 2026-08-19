"use client";

import { CardRow } from "./CardRow";

/**
 * Contenu de la page Règles — réutilisé en plein écran (/regles) et dans le
 * panneau ouvert en cours de partie. Chaque section illustrée par de vraies
 * cartes SVG animées.
 */

export const RULES_SECTIONS = [
  { id: "materiel", title: "Matériel & mise en place" },
  { id: "tour", title: "Le tour de jeu" },
  { id: "combinaisons", title: "Les combinaisons (0 point)" },
  { id: "as", title: "L'As : en bas ou en haut" },
  { id: "poser", title: "Poser & décompte" },
  { id: "remi-sec", title: "Le Rémi sec" },
  { id: "contre", title: "Le contre" },
  { id: "egalite", title: "Les égalités" },
  { id: "fin", title: "Fin de partie" },
] as const;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[color:var(--border)] py-6 first:border-t-0">
      <h2 className="mb-3 text-xl font-display font-bold">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-[color:var(--text)]">{children}</div>
    </section>
  );
}

function Illus({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <div className="my-1 rounded-2xl panel-soft p-4">
      <div className="flex justify-center overflow-hidden">{children}</div>
      {caption && <p className="mt-3 text-center text-xs text-[color:var(--text-soft)]">{caption}</p>}
    </div>
  );
}

export function RulesContent() {
  return (
    <div>
      <Section id="materiel" title="Matériel & mise en place">
        <p>
          Un jeu de <strong>52 cartes</strong>, de <strong>2 à 6 joueurs</strong>. On distribue{" "}
          <strong>10 cartes</strong> chacun à 2 joueurs, <strong>7 cartes</strong> chacun à 3 joueurs ou plus.
        </p>
        <p>
          Valeurs : <strong>As = 1</strong>, cartes 2 à 10 à leur valeur faciale, <strong>Valet / Dame / Roi = 10</strong>.
        </p>
        <Illus caption="As = 1 · figures = 10">
          <CardRow
            cards={[
              { rank: "A", suit: "hearts" },
              { rank: "7", suit: "spades" },
              { rank: "J", suit: "clubs" },
              { rank: "K", suit: "diamonds" },
            ]}
          />
        </Illus>
      </Section>

      <Section id="tour" title="Le tour de jeu">
        <p>
          Le donneur distribue&nbsp;; <strong>le joueur à sa gauche commence</strong>&nbsp;; on tourne dans le sens des
          aiguilles d'une montre.
        </p>
        <p>
          À son tour : <strong>piocher une carte</strong> — la première de la pioche <em>ou</em> la carte visible de la
          défausse — puis <strong>jeter une carte</strong> (la main garde sa taille).
        </p>
        <p className="text-sm text-[color:var(--text-soft)]">
          Pioche épuisée : on retourne la défausse pour reformer la pioche <strong>en conservant la dernière carte
          jetée</strong>. On ne mélange pas : le donneur coupe simplement le paquet.
        </p>
      </Section>

      <Section id="combinaisons" title="Les combinaisons (0 point)">
        <p>
          <strong>Brelan</strong> : 3 ou 4 cartes de <strong>même valeur</strong>, de familles différentes.
        </p>
        <Illus caption="Le brelan de 8 s'assemble — 0 point">
          <CardRow
            cards={[
              { rank: "8", suit: "spades" },
              { rank: "8", suit: "hearts" },
              { rank: "8", suit: "clubs" },
              { rank: "8", suit: "diamonds" },
            ]}
          />
        </Illus>
        <p>
          <strong>Suite</strong> : 3 cartes ou plus qui se suivent <strong>dans la même famille</strong>.
        </p>
        <Illus caption="La suite ♠ 5-6-7-8 glisse — 0 point">
          <CardRow
            cards={[
              { rank: "5", suit: "spades" },
              { rank: "6", suit: "spades" },
              { rank: "7", suit: "spades" },
              { rank: "8", suit: "spades" },
            ]}
          />
        </Illus>
      </Section>

      <Section id="as" title="L'As : en bas ou en haut">
        <p>
          L'As peut se placer <strong>en bas</strong> (As-2-3) <strong>ou en haut</strong> (Dame-Roi-As), mais{" "}
          <strong>jamais à cheval</strong> : Roi-As-2 est interdit.
        </p>
        <Illus caption="As-2-3 ✓ · Dame-Roi-As ✓">
          <div className="flex flex-wrap justify-center gap-4">
            <CardRow
              cards={[
                { rank: "A", suit: "hearts" },
                { rank: "2", suit: "hearts" },
                { rank: "3", suit: "hearts" },
              ]}
            />
            <CardRow
              cards={[
                { rank: "Q", suit: "spades" },
                { rank: "K", suit: "spades" },
                { rank: "A", suit: "spades" },
              ]}
            />
          </div>
        </Illus>
        <Illus caption="Roi-As-2 — interdit (l'As ne chevauche pas)">
          <div className="relative">
            <CardRow
              animate={false}
              cards={[
                { rank: "K", suit: "clubs", dim: true },
                { rank: "A", suit: "clubs", dim: true },
                { rank: "2", suit: "clubs", dim: true },
              ]}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-contre px-3 py-1 text-sm font-bold text-white shadow-lg">
                ⃠ interdit
              </span>
            </div>
          </div>
        </Illus>
      </Section>

      <Section id="poser" title="Poser & décompte">
        <p>
          À son tour, un joueur peut <strong>poser</strong> si le total de sa main <strong>hors combinaisons</strong> est{" "}
          <strong>≤ 10 points</strong>. La manche s'arrête aussitôt.
        </p>
        <p>
          Pour <strong>tous</strong> les joueurs, brelans et suites comptent 0 : on n'additionne que les cartes isolées.
        </p>
        <p>
          Le poseur marque <strong>ses points restants + la somme des points de tous les adversaires</strong>.
        </p>
        <Illus caption="Je pose à 7, les adversaires ont 15 et 26 → je marque 48">
          <div className="flex items-baseline gap-2 text-3xl font-black tnum">
            <span>7</span>
            <span className="text-[color:var(--text-soft)]">+</span>
            <span>15</span>
            <span className="text-[color:var(--text-soft)]">+</span>
            <span>26</span>
            <span className="text-[color:var(--text-soft)]">=</span>
            <span className="gold-shimmer">48</span>
          </div>
        </Illus>
      </Section>

      <Section id="remi-sec" title="Le Rémi sec (poser à 0)">
        <p>
          Poser à <strong>0 point</strong>, c'est le <strong>Rémi sec</strong> : bonus de{" "}
          <strong>10 × nombre de joueurs</strong> ajouté au score de la manche.
        </p>
        <Illus caption="2 j → +20 · 3 j → +30 · 4 j → +40 · 5 j → +50 · 6 j → +60">
          <div className="animate-pop-gold rounded-2xl bg-gold px-5 py-3 text-2xl font-black text-felt-deep shadow-glow">
            RÉMI SEC !
          </div>
        </Illus>
      </Section>

      <Section id="contre" title="Le contre (le poseur se fait coiffer)">
        <p>
          Si au décompte un adversaire a <strong>strictement moins</strong> de points que le poseur, celui-ci est{" "}
          <strong>coiffé</strong> : il <strong>perd 10 × nombre de joueurs</strong> points, et le joueur au plus bas
          total marque comme s'il avait posé (ses points + tous les autres, poseur malheureux compris).
        </p>
        <Illus caption="Poseur à 7, adversaires à 5 et 3 → le joueur à 3 rafle tout ; le poseur perd 10 × joueurs">
          <div className="flex items-center gap-4">
            <div className="animate-flip-in rounded-xl panel px-4 py-2 text-center">
              <div className="text-xs text-[color:var(--text-soft)]">poseur</div>
              <div className="text-2xl font-black tnum text-contre">7</div>
            </div>
            <span className="text-2xl">→</span>
            <div className="rounded-xl bg-gold px-4 py-2 text-center text-felt-deep">
              <div className="text-xs">rafle tout</div>
              <div className="text-2xl font-black tnum">3</div>
            </div>
          </div>
        </Illus>
      </Section>

      <Section id="egalite" title="Les égalités au plus bas">
        <p>
          En cas d'<strong>égalité</strong> au plus bas total (entre le poseur et des adversaires, ou entre adversaires
          lors d'un contre), le total de la manche est <strong>réparti à parts égales</strong> entre les ex æquo,{" "}
          <strong>arrondi au supérieur</strong> pour chacun.
        </p>
        <p className="text-sm text-[color:var(--text-soft)]">
          Exemple : un pot de 47 réparti entre 2 ex æquo → 24 points chacun. Si les ex æquo sont à 0, chacun touche
          aussi le bonus Rémi sec.
        </p>
      </Section>

      <Section id="fin" title="Fin de partie">
        <p>
          Le premier joueur à atteindre <strong>100 × nombre de joueurs</strong> points (réglable) déclenche la fin.
          Chacun distribue à tour de rôle, dans le sens horaire, jusqu'au bout.
        </p>
      </Section>
    </div>
  );
}
