# Consignes pour Claude (relecture et analyse)

Écris tes commentaires, analyses et issues **en français**, courts et concrets : le problème, l'endroit (fichier:ligne), la conséquence pour l'utilisateur, la correction.

## Le projet

Voisin : appli mobile de prêt et de don d'objets entre voisins d'une même résidence. React 18 + Vite + TypeScript + Tailwind, pnpm. Structure et fonctionnement : `docs/03-technical.md`.

## Ce qu'il faut vérifier en priorité

- **Bugs** : logique fausse, plantage, état incohérent, cas limites (liste vide, champ vide, date passée).
- **Texte d'interface en français** : tout texte visible (boutons, messages, `aria-label`, titres) doit être en français. Un texte anglais visible est un bug.
- **Références de logement** au format `X-Nn` (bâtiment en majuscule, étage en chiffres, porte en minuscule, ex. `A-3a`) : voir `shared/location.ts`.
- **Données et sécurité** : tout passe par Supabase (`client/lib/data.ts`, conversions dans `shared/db.ts`). Chaque voisin ne doit voir que sa résidence : toute nouvelle table ou requête doit respecter la sécurité par ligne (RLS), décrite dans `supabase/migrations/`.
- **Base de données** : une modification du schéma passe par un fichier dans `supabase/migrations/`, jamais seulement dans le tableau de bord.
- **Mobile d'abord** : la mise en page doit tenir à 360 px de large, sans défilement horizontal.
- **Logique partagée** dans `shared/` : toute nouvelle règle doit y avoir un test (`*.spec.ts`).

## Ce qu'il ne faut pas signaler

- Le style pur (formatage, ordre des imports) : Prettier s'en charge.
- Le design volontairement simple : la priorité est que l'appli fonctionne de bout en bout.
