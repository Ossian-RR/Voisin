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
| `residence_requests` | Demandes de nouvelles résidences (formulaire public) ; lisibles seulement dans le tableau de bord |

**Isolation par résidence** : la sécurité par ligne (RLS) limite tout ce qu'un voisin voit à sa résidence (`private.my_residence_id()`). Un voisin ne peut ni choisir ni changer sa résidence.

## Nouvelle résidence : de la demande aux invitations

1. **La demande arrive.** Sur l'écran Connexion, « Demander Voisin pour ma résidence » ouvre un formulaire public (nom, e-mail, adresse, nombre de logements, message). La demande est enregistrée dans `residence_requests` et un e-mail part vers l'administrateur via Resend. Il suffit de répondre à cet e-mail pour écrire au demandeur.
   Prérequis, une fois pour toutes : dans Supabase → Project Settings → **Vault**, deux secrets : `resend_api_key` (clé API Resend, permission « Sending access ») et `admin_email` (votre adresse). Sans eux, les demandes sont quand même enregistrées, mais sans e-mail.
2. **Voir les demandes** : Table Editor → `residence_requests`. Passez `status` à `done` ou `refused` une fois traitée.
3. **Créer la résidence** (SQL Editor) :

```sql
insert into public.residences (name, address)
values ('Les Tilleuls', '12 rue des Lilas, Lyon')
returning id;
```

4. **Inviter les voisins** : Authentication → Users → **Invite user**, une fois par adresse e-mail.
5. **Les rattacher à la résidence** (SQL Editor), avec l'`id` obtenu à l'étape 3 :

```sql
select private.add_to_residence('<id de la résidence>', array['marie@exemple.fr', 'paul@exemple.fr']);
```

Le résultat indique combien de comptes ont été trouvés : s'il est plus petit que le nombre d'adresses, une adresse est mal écrite ou n'a pas encore été invitée.

À sa première connexion, chaque voisin remplit civilité, nom et logement ; son profil est créé dans cette résidence. S'il ouvre l'invitation avant l'étape 5, l'appli affiche « Aucune résidence » ; « Réessayer » suffit ensuite.

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
