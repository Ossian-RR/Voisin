# Plan de développement, par demi-journées

Chaque étape dure une demi-journée (3 à 4 heures de travail). Elle a un but, des tâches et un critère « Terminé quand ». On ne passe à l'étape suivante que si le critère est rempli.

Repères : **[fait]** = dans le code aujourd'hui. **[à faire]** = reste à faire. **[tableau de bord]** = réglage à vérifier dans Supabase, Vercel ou GitHub (pas dans le code).

Mise à jour du 29 octobre 2026 : le plan d'origine prévoyait Neon et un serveur Express. L'appli a été construite avec **Supabase** (base, connexion, photos) et sans serveur à nous : la sécurité repose sur la sécurité par ligne (RLS) dans `supabase/migrations/`. Les phases 0 à 7 sont réécrites en conséquence ; la phase 8 (sécurité avant lancement) est nouvelle.

---

## Phases 0 à 3 : outils, design, coquille, consultation [fait]

- Outils (pnpm, Vite, React, Tailwind), palette et polices, coquille avec barre d'onglets, accueil « J'emprunte », fiche objet avec carrousel.
- **Reste** : 3.3 passage sur vrais téléphones à 360, 375 et 430 px (voir `05-testing.md`) **[à faire]**.

## Phase 4 : données dans Supabase [fait]

- Tables `residences`, `profiles`, `items`, `borrow_requests`, `wanted_requests`, `help_messages`, `residence_requests`, bucket privé `photos`. Toute modification passe par `supabase/migrations/`.
- Lectures et écritures dans `client/lib/data.ts`, conversions testées dans `shared/db.ts`.

## Phase 5 : comptes et confiance [fait]

- Connexion par lien e-mail, sur invitation uniquement (`shouldCreateUser: false`).
- Session gardée sur le téléphone ; après « Se déconnecter », écran « Bon retour ! » avec la dernière adresse (`shared/remembered-email.ts`).
- Isolation par résidence : RLS sur toutes les tables, `private.my_residence_id()`.
- Nouveau voisin : page Profil, puis demande via Aide ; l'admin le rattache avec `private.add_to_residence`.

## Phase 6 : prêter, emprunter, donner [fait]

- Formulaire « Je prête » avec photos réduites dans le navigateur, demandes d'emprunt (en attente, acceptée, refusée, rendu), « Je cherche ».

## Phase 7 : tests et finitions (1 jour)

### 7.1 Tests unitaires [fait, à compléter]
- Toute règle de `shared/` a son `*.spec.ts`. `pnpm test` tourne à chaque pull request (GitHub Actions « Vérifier »).
- **Reste** : mettre à jour `05-testing.md`, qui parle encore de `shared/mock.ts` et de Zod.

### 7.2 Contrôles par largeur [à faire]
- Liste de `05-testing.md` à 360 x 800, 375 et 430. Une capture par défaut trouvé.

### 7.3 Accessibilité [à faire]
- Libellés en français, focus visibles, ordre des titres, boutons-icônes avec `aria-label`. VoiceOver ou TalkBack sur l'accueil et le parcours d'emprunt.

---

## Phase 8 : sécurité avant lancement (3 jours) [nouveau]

Les deux listes de contrôle (« 20 choses à faire » et « 18 risques ») sont reprises point par point en fin de document. Les étapes ci-dessous regroupent ce qui reste à faire, par ordre de priorité.

### 8.1 Cacher l'e-mail des voisins [à faire, priorité 1]
- **Problème** : `grant select on public.profiles to authenticated` (première migration) porte sur toute la table, donc aussi sur la colonne `email` ajoutée ensuite. Tout voisin connecté peut lire l'e-mail de ses voisins de résidence avec `supabase.from("profiles").select("email")`. Le commentaire de `20261027180000_profile_email.sql` (« neighbors can't read it ») et `03-technical.md` disent le contraire.
- **Correction** : une migration qui fait `revoke select on public.profiles from authenticated`, puis `grant select (id, user_id, civility, last_name, location, photo_path, admitted_on, residence_id, confirmed_at, created_at)` (toutes les colonnes sauf `email`).
- **Terminé quand** : connecté en voisin, `select email from profiles` est refusé, et l'appli fonctionne comme avant.

### 8.2 En-têtes de sécurité et HTTPS [à faire]
- Ajouter dans `vercel.json` : `Content-Security-Policy` (sources autorisées : le site, `*.supabase.co`, Google Fonts, Vercel Analytics ; `frame-ancestors 'none'`), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (caméra seulement si la prise de photo en a besoin).
- La CSP compte particulièrement : la session Supabase est gardée dans le stockage du navigateur, donc une faille XSS permettrait de la voler.
- **Terminé quand** : securityheaders.com donne au moins A sur l'adresse de production, et toutes les pages marchent (connexion, photos, statistiques).

### 8.3 Limites et robots [à faire]
- **Connexion** : vérifier Authentication → Rate Limits (envois d'e-mails par heure, vérifications de lien) **[tableau de bord]**.
- **E-mails** : vérifier qu'un SMTP personnel (Resend) est réglé dans Authentication → SMTP. L'envoi par défaut de Supabase est limité à quelques e-mails par heure : au-delà, les voisins ne reçoivent plus de lien **[tableau de bord]**.
- **Robots** : activer le CAPTCHA de Supabase (Cloudflare Turnstile) sur la connexion et sur le formulaire public « Demander Voisin pour ma résidence ». Ce formulaire a déjà une limite en base (1 demande par e-mail et par jour, 30 par heure).
- **Aide** : ajouter une limite à `help_messages` (par exemple 5 messages par voisin et par jour), sur le modèle de `private.limit_residence_requests`. Chaque message envoie un e-mail à l'admin.
- **Terminé quand** : une 6e aide dans la journée est refusée avec un message en français, et le CAPTCHA s'affiche sur les deux formulaires publics.

### 8.4 Bornes sur les champs [à faire]
- Ajouter dans une migration des contraintes de longueur qui manquent : `profiles.last_name` (ex. 1 à 60), `items.description` (ex. 2000 max), nombre de photos dans `items.photos` (ex. 5 max).
- Mettre les mêmes bornes dans `shared/` (avec tests) pour afficher le message avant l'envoi.
- **Terminé quand** : un envoi trop long est refusé par la base, même en contournant l'appli.

### 8.5 Photos [fait, à compléter]
- Déjà fait : bucket privé, 2 Mo maximum, JPEG, PNG ou WebP seulement (pas de SVG), chaque voisin n'écrit que dans son dossier, lecture limitée à sa résidence, liens temporaires.
- **Reste** : réserver l'envoi de photos aux voisins rattachés à une résidence, et supprimer les photos d'un objet supprimé (sinon elles restent stockées).

### 8.6 Test d'isolation entre résidences [à faire]
- Script de test (SQL ou Vitest contre une base de test) avec deux résidences et trois voisins. Il vérifie qu'un voisin de la résidence A ne lit, ne modifie ni ne supprime rien de la résidence B (profils, objets, demandes, photos), et qu'il ne peut changer ni son `residence_id` ni sa date d'admission.
- **Terminé quand** : le script passe et se relance après chaque migration.

### 8.7 Comptes et dépendances [à faire]
- Double authentification sur les comptes Supabase, Vercel, GitHub et Resend. Mot de passe de la base unique et fort **[tableau de bord]**.
- Vercel : seules les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sont présentes, jamais la clé secrète ni la clé `service_role` **[tableau de bord]**.
- Supabase → Authentication → URL Configuration : n'autoriser que l'adresse de production et les adresses de prévisualisation Vercel du projet **[tableau de bord]**.
- GitHub : activer Dependabot (alertes et mises à jour) et la protection contre l'envoi de secrets (« push protection ») ; ajouter `pnpm audit --prod` à la vérification « Vérifier ».
- **Terminé quand** : chaque case est cochée et `pnpm audit --prod` ne trouve rien (c'est le cas au 29 octobre 2026).

---

## Phase 9 : pilote et lancement (1 jour)

### 9.1 Mise en ligne [fait, à compléter]
- Vercel déploie `main` ; chaque pull request a sa prévisualisation.
- **Reste** : manifeste et icônes pour l'ajout à l'écran d'accueil ; phase 8 terminée avant d'inviter des voisins.

### 9.2 Pilote avec des voisins [à faire]
- Inviter 5 à 10 voisins d'une résidence. Chacun prête un objet et en emprunte un. Noter les retours, corriger les trois premiers problèmes.
- **Terminé quand** : chaque voisin du pilote a fait un prêt et un emprunt, et les trois premiers problèmes sont corrigés.

---

## Liste de contrôle : 20 choses à faire avant le lancement

| # | Point | État | Où / quoi |
|---|---|---|---|
| 1 | Cacher les clés d'API | Fait | Seule la clé publique Supabase est dans `.env`, prévue pour le navigateur. La clé Resend est dans le coffre (Vault) de Supabase. |
| 2 | Purger les secrets de Git | Fait | Historique vérifié le 29 octobre 2026 : aucune clé secrète. Protection contre l'envoi de secrets : 8.7. |
| 3 | Protéger les clés de la base | À vérifier | 8.7 : ni clé secrète ni `service_role` dans Vercel, mot de passe de la base fort. |
| 4 | Activer la sécurité par ligne | Fait | RLS sur les 7 tables et le bucket `photos`. Test automatique : 8.6. |
| 5 | Chiffrer les données sensibles | En partie | Chiffrement au repos et en transit (Supabase, HTTPS). Fuite de l'e-mail entre voisins : 8.1. |
| 6 | Contrôler les droits côté serveur | Fait | Tout est vérifié par la base (RLS, droits par colonne). Les contrôles de l'appli ne servent qu'à l'affichage. |
| 7 | Verrouiller l'accès aux enregistrements | Fait | Seul le propriétaire modifie ou supprime son objet, sa demande ou son profil. |
| 8 | Bloquer la modification de champs interdits | Fait | Droits par colonne : impossible de changer sa résidence, sa date d'admission ou l'emprunteur d'une demande. |
| 9 | Sécuriser les cookies de session | Sans objet, compensé | Pas de cookie : jeton Supabase dans le stockage du navigateur, renouvelé automatiquement. Protection contre le vol par XSS : CSP (8.2). |
| 10 | Hacher les mots de passe | Sans objet | Pas de mot de passe : connexion par lien e-mail. |
| 11 | Limiter les tentatives de connexion | À vérifier | 8.3 : limites d'Authentication et SMTP Resend. |
| 12 | Protéger contre les robots | À faire | 8.3 : CAPTCHA Turnstile sur la connexion et la demande de résidence. |
| 13 | Requêtes paramétrées | Fait | Client Supabase (aucune requête SQL écrite à la main dans l'appli). Les fonctions SQL n'exécutent pas de SQL construit à partir de texte. |
| 14 | Valider toutes les saisies | En partie | Règles dans `shared/` et contraintes en base. Bornes manquantes : 8.4. |
| 15 | Échapper le contenu des utilisateurs | Fait | React échappe tout ; aucun `dangerouslySetInnerHTML`. E-mails à l'admin en texte brut. |
| 16 | Restreindre les envois de fichiers | Fait, à compléter | Taille, types et dossiers limités. Reste : 8.5. |
| 17 | Alléger les réponses de l'API | À faire | Colonnes choisies une à une dans `shared/db.ts`, mais `email` reste lisible : 8.1. |
| 18 | Ajouter les en-têtes de sécurité | À faire | 8.2. |
| 19 | Forcer HTTPS | Fait, à compléter | Vercel et Supabase en HTTPS uniquement. Ajouter HSTS : 8.2. |
| 20 | Analyser les dépendances | À faire | `pnpm audit --prod` propre aujourd'hui ; Dependabot et audit en CI : 8.7. |

## Liste de contrôle : 18 risques à vérifier avant le lancement

| # | Risque | État | Où / quoi |
|---|---|---|---|
| 1 | XSS | Faible | React échappe le texte, pas de HTML injecté. CSP en plus : 8.2. |
| 2 | CSRF | Sans objet | La connexion passe par un jeton envoyé dans l'en-tête, pas par un cookie. |
| 3 | Envois de fichiers dangereux | Faible | Images uniquement (pas de SVG), 2 Mo maximum, affichées en `<img>`. Reste : 8.5. |
| 4 | Accès à des fichiers hors de son dossier (« path traversal ») | Fait | Les règles de stockage n'autorisent l'écriture que dans le dossier du voisin. |
| 5 | Requêtes forcées vers d'autres serveurs (SSRF) | Fait | Seul appel sortant : `api.resend.com`, adresse fixe dans la base. |
| 6 | Réinitialisation de mot de passe défaillante | Sans objet | Pas de mot de passe. Vérifier que « Secure email change » est actif dans Supabase (8.7). |
| 7 | Gestion de session faible | Fait | Jeton court renouvelé automatiquement ; « Se déconnecter » ferme la session. |
| 8 | Secret JWT exposé | Fait | Géré par Supabase, jamais dans le code. |
| 9 | CORS trop permissif | Acceptable | L'API Supabase accepte toutes les origines par conception ; la protection vient de la RLS et du jeton. |
| 10 | Absence de limites | À faire | Demandes de résidence limitées ; reste l'Aide et la connexion : 8.3. |
| 11 | Variables d'environnement exposées | Fait | Seules les variables `VITE_` (publiques) partent dans le navigateur. Vérifier Vercel : 8.7. |
| 12 | Identifiants par défaut | À vérifier | Double authentification et mots de passe des comptes : 8.7. |
| 13 | Webhooks non signés | Sans objet | Aucun webhook entrant. |
| 14 | Paiement vérifié seulement dans l'appli | Sans objet | Pas de paiement. Équivalent ici : les règles d'emprunt (objet disponible, pas le sien) sont vérifiées par la base. |
| 15 | Accès aux objets d'un autre (IDOR / BOLA) | Fait, à tester | RLS par résidence et par propriétaire. Test automatique : 8.6. |
| 16 | Saisies acceptées sans contrôle | En partie | 8.4. |
| 17 | Journaux et détails d'erreur exposés | Fait | Les erreurs Supabase sont traduites en messages français, sans détail technique. |
| 18 | Cartes de source (source maps) exposées | Fait | Le build n'en produit pas (vérifié : aucun fichier `.map` dans `dist/`). |

---

## Total restant

Environ 10 demi-journées : phase 7 (2), phase 8 (6), phase 9 (2), plus le temps du pilote.
