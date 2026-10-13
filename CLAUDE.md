# Consignes pour Claude (relecture et analyse)

Écris tes commentaires, analyses et issues **en français**, courts et concrets : le problème, l'endroit (fichier:ligne), la conséquence pour l'utilisateur, la correction.

## Le projet

Common Shed / Voisin : appli mobile de prêt et de don d'objets entre voisins d'une même résidence. React 18 + Vite + TypeScript + Tailwind, pnpm. Voir `AGENTS.md` (structure) et `docs/` (fonctionnalités, règles).

## Ce qu'il faut vérifier en priorité

- **Bugs** : logique fausse, plantage, état incohérent, cas limites (liste vide, champ vide, date passée).
- **Texte d'interface en français** : tout texte visible (boutons, messages, `aria-label`, titres) doit être en français. Un texte anglais visible est un bug.
- **Références de logement** au format `X-Nn` (bâtiment en majuscule, étage en chiffres, porte en minuscule, ex. `A-3a`) : voir `shared/location.ts`.
- **Stockage local** : les données passent par `client/lib/local-store.ts`. Lecture et écriture ne doivent jamais faire planter la page (navigation privée, stockage plein).
- **Mobile d'abord** : la mise en page doit tenir à 360 px de large, sans défilement horizontal.
- **Logique partagée** dans `shared/` : toute nouvelle règle doit y avoir un test (`*.spec.ts`).

## Ce qu'il ne faut pas signaler

- Le style pur (formatage, ordre des imports) : Prettier s'en charge.
- Les composants générés dans `client/components/ui/`, sauf bug réel.
- L'absence de base de données ou de comptes : c'est prévu pour plus tard (`docs/04-roadmap-half-days.md`).
