# Fonctionnement technique

## Pile

React 18 + TypeScript + Vite, Tailwind, React Router, React Query (cache des données), Supabase (base Postgres, connexion par lien e-mail, stockage des photos), Vercel (hébergement + Analytics). Tests : Vitest. pnpm.

## Dossiers

```
client/
  App.tsx                 # Entrée : routes, fournisseurs (données, connexion)
  lib/supabase.ts         # Le client Supabase (clés publiques dans .env)
  lib/auth.tsx            # Session, profil et résidence du voisin connecté (useMe)
  lib/data.ts             # Toutes les lectures/écritures Supabase (hooks React Query)
  components/auth/        # Écran de connexion, porte d'entrée (AuthGate)
  pages/                  # J'emprunte, objet, Je prête, Je cherche, Demandes, Profil, Aide
shared/
  api.ts                  # Types de l'appli
  db.ts                   # Conversion lignes Supabase <-> types (testé)
  borrow.ts, wanted.ts, profile.ts, new-item.ts, location.ts, residence.ts, auth.ts
supabase/migrations/      # Le schéma, migration par migration
```

## Données (Supabase)

| Table | Contenu |
|---|---|
| `residences` | Nom (facultatif) et adresse |
| `profiles` | Un par voisin : civilité, nom, logement, photo, date d'admission, **résidence** |
| `items` | Objets prêtés ou donnés ; photos dans le bucket privé `photos` |
| `borrow_requests` | Demandes d'emprunt : en attente, acceptée, refusée, rendu |
| `wanted_requests` | « Je cherche… » |

**Isolation par résidence** : la sécurité par ligne (RLS) limite tout ce qu'un voisin voit à sa résidence (`private.my_residence_id()`). Un voisin ne peut ni choisir ni changer sa résidence.

## Inviter un voisin

1. Supabase → Authentication → Users → **Invite user** (son e-mail).
2. Dans le SQL Editor, rattacher la personne à sa résidence :

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('residence_id', '<id de la résidence>')
where email = 'voisin@exemple.fr';
```

À sa première connexion, le voisin remplit civilité, nom et logement ; son profil est créé dans cette résidence. Sans résidence, l'appli affiche « Aucune résidence ».

Nouvelle résidence : `insert into public.residences (address, name) values ('…', '…') returning id;`

## Commandes

```
pnpm dev        # http://localhost:8080
pnpm test       # tests de shared/
pnpm typecheck
pnpm build      # dist/spa, servi par Vercel
```

Chaque pull request est vérifiée par GitHub Actions (`Vérifier`) et reçoit un lien de prévisualisation Vercel. Un merge dans `main` met l'appli en ligne.

## Règles

- Tout texte visible en français.
- Toute modification du schéma : un nouveau fichier dans `supabase/migrations/`, puis régénérer `shared/database.types.ts`.
- Toute règle dans `shared/` a son test.
