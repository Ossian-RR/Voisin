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

### 7.1 Tests unitaires [fait]
- Toute règle de `shared/` a son `*.spec.ts`. `pnpm test` tourne à chaque pull request (GitHub Actions « Vérifier »).
- `05-testing.md` à jour (9 novembre 2026) : commandes (`typecheck`, `test`, `test:db`, `build`, `audit`), ce que couvrent les tests, contrôles à la main avec les vrais libellés de l'appli.

### 7.2 Contrôles par largeur [fait]
- 10 novembre 2026 : 17 écrans (accueil, 4 fiches d'objets dont un don, un objet emprunté et un objet à soi, Je cherche, Je prête, Demandes, Profil, Aide, pages introuvables, nouveau voisin, voisin sans résidence, connexion, demande de résidence) à 360, 375 et 430 px, dans Chromium avec une fausse base (titres et adresse longs, demandes reçues et envoyées). Aucun défilement horizontal, barre d'onglets entière, champs à 16 px (pas de zoom sur iOS), titres longs coupés à deux lignes.
- **Trouvé et corrigé** : « Résidence Résidence Les Jardins… » dans l'en-tête et sur Profil quand le nom saisi par l'admin commence déjà par « Résidence » (`shared/residence.ts`, avec tests).
- **Corrigé le 12 novembre 2026** : pas d'espace insécable devant « ? », « ! », « : » et à l'intérieur des guillemets, donc un « ? » pouvait se retrouver seul en début de ligne (vu sur « Demander Voisin pour ma résidence »). 24 espaces remplacées dans 9 fichiers ; `client/lib/typography.spec.ts` vérifie toutes les chaînes de l'appli pour que ça ne revienne pas.

### 7.3 Accessibilité [fait, essai lecteur d'écran à faire]
- Contrôles automatiques sur les mêmes écrans : un seul `h1` par page et pas de saut de niveau, tous les boutons et liens ont un nom, tous les champs ont une étiquette, images avec `alt`, contraste WCAG AA, contour visible en naviguant au clavier, tout texte visible en français, titre d'onglet par page.
- **Trouvé et corrigé** : badge « À donner » trop peu contrasté (3,6:1, il faut 4,5:1) : fond orange foncé réservé au badge (5,2:1), l'orange du logo ne change pas ; aucun contour au focus sur les champs de formulaire (seule la bordure changeait) : anneau vert comme sur l'écran de connexion ; « Objet introuvable » n'était pas un titre ; sur l'accueil, les titres des cartes (`h3`) n'avaient pas de `h2` au-dessus.
- **Reste** : VoiceOver (iPhone) ou TalkBack (Android) sur l'accueil et le parcours d'emprunt, à faire sur un vrai téléphone.

---

## Phase 8 : sécurité avant lancement (3 jours) [nouveau]

Les deux listes de contrôle (« 20 choses à faire » et « 18 risques ») sont reprises point par point en fin de document. Les étapes ci-dessous regroupent ce qui reste à faire, par ordre de priorité.

### 8.1 Cacher l'e-mail des voisins [fait]
- **Problème** : `grant select on public.profiles to authenticated` (première migration) portait sur toute la table, donc aussi sur la colonne `email` ajoutée ensuite. Tout voisin connecté pouvait lire l'e-mail de ses voisins de résidence.
- **Correction** : `supabase/migrations/20261102100000_hide_profile_email.sql` retire la lecture de toute la table et la rend colonne par colonne, sauf `email`. Testée sur un Postgres 16 local : avant, un voisin lit les e-mails ; après, la lecture est refusée (même avec `select *`), et la lecture, la création et la modification du profil marchent comme avant.
- Appliquée à la base le 9 novembre 2026.

### 8.2 En-têtes de sécurité et HTTPS [fait]
- `vercel.json` envoie sur toutes les pages : `Content-Security-Policy`, `Strict-Transport-Security` (2 ans), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (caméra, micro, position, paiement coupés : la photo passe par le sélecteur de fichiers, qui n'en a pas besoin) et `Cross-Origin-Opener-Policy`.
- La CSP n'autorise que le site lui-même, Supabase (`*.supabase.co`, données et photos), Google Fonts, les images locales (`blob:`, `data:`) et les styles en ligne (écran d'accueil, notifications). Aucun script extérieur ni inline ; l'appli ne peut pas être affichée dans un cadre. Elle compte particulièrement : la session Supabase est gardée dans le stockage du navigateur, donc une faille XSS permettrait de la voler.
- Testé en local (build servi avec ces en-têtes, Chromium) : polices, aperçu et envoi des photos et appels Supabase passent ; une adresse non prévue est bloquée.
- **Vérifié en production** le 2 novembre 2026 : securityheaders.com donne **A+** sur `voisin-mu.vercel.app`. Sur les prévisualisations, la barre d'outils Vercel (commentaires) est bloquée par la CSP : c'est voulu, l'appli fonctionne quand même. `access-control-allow-origin: *` est mis par Vercel sur les fichiers statiques : sans risque, ils sont publics et aucune session n'y passe.

### 8.3 Limites et robots [en partie]
- **Connexion** : vérifier Authentication → Rate Limits (envois d'e-mails par heure, vérifications de lien) **[tableau de bord]**.
- **E-mails** : vérifier qu'un SMTP personnel (Resend) est réglé dans Authentication → SMTP. L'envoi par défaut de Supabase est limité à quelques e-mails par heure : au-delà, les voisins ne reçoivent plus de lien **[tableau de bord]**.
- **Robots** [reporté après le pilote, décision du 2 novembre 2026 : les limites actuelles suffisent pour 5 à 10 voisins] : activer le CAPTCHA de Supabase (Cloudflare Turnstile) sur la connexion et sur le formulaire public « Demander Voisin pour ma résidence ». Ce formulaire a déjà une limite en base (1 demande par e-mail et par jour, 30 par heure).
- **Aide** [fait, appliquée à la base le 9 novembre 2026] : 5 messages par voisin et par jour au plus (`20261102160000_limit_help_messages.sql`, message en français dans `shared/residence.ts`). Chaque message envoie un e-mail à l'admin.
- **Terminé quand** : une 6e aide dans la journée est refusée avec un message en français, et le CAPTCHA s'affiche sur les deux formulaires publics.

### 8.4 Bornes sur les champs [fait, appliquée à la base le 9 novembre 2026]
- `20261102170000_field_bounds.sql` : nom de famille de 1 à 60 caractères, description d'objet de 2000 caractères au plus, 5 photos au plus (et une vraie liste). Contraintes `not valid` : vérifiées sur chaque ligne créée ou modifiée, sans faire échouer la migration à cause de lignes plus anciennes.
- Mêmes bornes dans `shared/profile.ts` (`MAX_LAST_NAME`) et `shared/new-item.ts` (`MAX_DESCRIPTION`, `MAX_PHOTOS`), avec tests ; les champs ont un `maxLength`, donc on ne peut pas taper plus.
- Déjà bornés avant : titre d'objet (120 en base, 80 dans l'appli), « Je cherche » (500), Aide (2000), demandes de résidence.
- Testé sur un Postgres 16 local : valeurs trop longues ou trop nombreuses refusées, bornes exactes acceptées.

### 8.5 Photos [fait, appliquée à la base le 9 novembre 2026]
- Déjà fait : bucket privé, 2 Mo maximum, JPEG, PNG ou WebP seulement (pas de SVG), lecture limitée à sa résidence, liens temporaires ; supprimer un objet supprime ses photos (`useRemoveItem`).
- `20261102180000_photo_upload_rules.sql` : on ne peut plus écrire n'importe quel nom de fichier dans son dossier. Seuls deux chemins sont acceptés : `<id>/avatar.jpg` dès qu'on a un profil (photo de Profil, même avant d'être rattaché), et `<id>/items/<objet>/<n>.jpg` une fois membre d'une résidence. Testé sur un Postgres 16 local (compte sans profil, profil sans résidence, membre).
- Photos orphelines (suppression interrompue par une coupure réseau, photo de profil retirée) : pas de nettoyage automatique, Supabase déconseille d'effacer les fichiers en SQL. Requête pour les repérer dans `03-technical.md`, à passer de temps en temps ; on les supprime depuis Storage.

### 8.6 Test d'isolation entre résidences [fait]
- `pnpm test:db` (`supabase/tests/`) : toutes les migrations sur un Postgres jetable avec une copie minimale de Supabase, puis 75 contrôles avec deux résidences et cinq voisins (deux dans A, un dans B, un profil sans résidence, une invitée sans profil) et un visiteur non connecté. Un voisin de B ne lit, ne modifie ni ne supprime rien de A (profils, e-mails, objets, demandes d'emprunt, « Je cherche », Aide, photos) ; personne ne change sa résidence, sa date d'admission ou l'emprunteur d'une demande ; dans une même résidence, chacun ne modifie que ce qui est à lui. Contrôles positifs aussi : ce qui est permis marche encore.
- Lancé à chaque pull request (« Vérifier », tâche `database`), donc après chaque migration.
- **Trouvé** : un voisin sans résidence pouvait créer un objet ou un « Je cherche » en appelant l'API (l'appli ne le propose pas). Personne ne les voyait, mais ils seraient apparus dans sa résidence une fois rattaché. Corrigé par `20261109100000_posts_need_residence.sql`.
- Migration appliquée à la base le 9 novembre 2026.

### 8.7 Comptes et dépendances [code fait, réglages à vérifier]
- Double authentification sur les comptes Supabase, Vercel, GitHub et Resend. Mot de passe de la base unique et fort **[tableau de bord]**.
- [fait, 9 novembre 2026] Vercel : aucune variable n'est nécessaire (l'URL et la clé publique sont dans `.env`, versionné). Le 9 novembre 2026, l'intégration Supabase de Vercel avait ajouté 16 variables, dont `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET` et `POSTGRES_PASSWORD` : jamais envoyées au navigateur (Vite ne publie que `VITE_*`), mais lisibles pendant chaque build. Supprimées le 9 novembre 2026 (aucune base reliée dans Vercel → Storage, donc sans risque pour la base) ; appli redéployée et vérifiée. Vérifier dans quelques jours qu'elles ne sont pas revenues **[tableau de bord]**.
- Supabase → Authentication → URL Configuration : n'autoriser que l'adresse de production et les adresses de prévisualisation Vercel du projet **[tableau de bord]**.
- GitHub : activer les alertes et les correctifs de sécurité Dependabot et la protection contre l'envoi de secrets (« push protection ») **[tableau de bord]**.
- [fait, 9 novembre 2026] `pnpm audit --prod` dans « Vérifier ». Les bibliothèques envoyées au navigateur (React, React Router, React Query…) étaient rangées dans `devDependencies`, donc l'audit `--prod` ne les voyait pas : il annonçait « rien » alors que React Router avait une faille grave (XSS par redirection). Elles sont passées dans `dependencies`, et React Router en version 7. Vite, Vitest et `yaml` mis à jour : `pnpm audit` ne trouve plus rien, même dans les outils.
- [fait] `.github/dependabot.yml` : une fois par mois, trois PR au plus (appli, outils, versions majeures à tester), plus une pour les actions GitHub ; les correctifs de sécurité arrivent sans attendre. Les mises à jour regroupées évitent les conflits entre deux PR Dependabot.
- **Terminé quand** : chaque case est cochée et `pnpm audit --prod` ne trouve rien.

---

## Phase 9 : pilote et lancement (1 jour)

### 9.1 Mise en ligne [fait, à vérifier sur téléphone]
- Vercel déploie `main` ; chaque pull request a sa prévisualisation.
- [fait, 9 novembre 2026] Ajout à l'écran d'accueil : `public/manifest.webmanifest` (nom « Voisin », plein écran sans barre d'adresse, fond vert de l'écran d'accueil), icônes dans `public/icons/` tirées du logo (192 et 512 px, une version « maskable » pour Android qui découpe en rond, et `apple-touch-icon.png` pour iOS). Chromium lit le manifeste sans erreur et juge l'appli installable.
- Pas de « service worker » (fonctionnement hors ligne) : inutile pour s'installer aujourd'hui, et il compliquerait les mises à jour et la session Supabase.
- **Reste** : l'essai sur un vrai iPhone et un vrai Android (voir `05-testing.md`) ; phase 8 terminée avant d'inviter des voisins.

### 9.2 Pilote avec des voisins [à faire]
- Inviter 5 à 10 voisins d'une résidence. Chacun prête un objet et en emprunte un. Noter les retours, corriger les trois premiers problèmes.
- **Terminé quand** : chaque voisin du pilote a fait un prêt et un emprunt, et les trois premiers problèmes sont corrigés.

---

## Liste de contrôle : 20 choses à faire avant le lancement

| # | Point | État | Où / quoi |
|---|---|---|---|
| 1 | Cacher les clés d'API | Fait | Seule la clé publique Supabase est dans `.env`, prévue pour le navigateur. La clé Resend est dans le coffre (Vault) de Supabase. |
| 2 | Purger les secrets de Git | Fait | Historique vérifié le 29 octobre 2026 : aucune clé secrète. Protection contre l'envoi de secrets : 8.7. |
| 3 | Protéger les clés de la base | En partie | Clés secrètes retirées de Vercel le 9 novembre 2026 (8.7). Reste : mot de passe de la base fort. |
| 4 | Activer la sécurité par ligne | Fait | RLS sur les 7 tables et le bucket `photos`. Test automatique à chaque pull request : 8.6. |
| 5 | Chiffrer les données sensibles | Fait | Chiffrement au repos et en transit (Supabase, HTTPS). E-mail des voisins caché : 8.1. |
| 6 | Contrôler les droits côté serveur | Fait | Tout est vérifié par la base (RLS, droits par colonne). Les contrôles de l'appli ne servent qu'à l'affichage. |
| 7 | Verrouiller l'accès aux enregistrements | Fait | Seul le propriétaire modifie ou supprime son objet, sa demande ou son profil. |
| 8 | Bloquer la modification de champs interdits | Fait | Droits par colonne : impossible de changer sa résidence, sa date d'admission ou l'emprunteur d'une demande. |
| 9 | Sécuriser les cookies de session | Sans objet, compensé | Pas de cookie : jeton Supabase dans le stockage du navigateur, renouvelé automatiquement. Protection contre le vol par XSS : CSP (8.2). |
| 10 | Hacher les mots de passe | Sans objet | Pas de mot de passe : connexion par lien e-mail. |
| 11 | Limiter les tentatives de connexion | À vérifier | 8.3 : limites d'Authentication et SMTP Resend. |
| 12 | Protéger contre les robots | À faire | 8.3 : CAPTCHA Turnstile sur la connexion et la demande de résidence. |
| 13 | Requêtes paramétrées | Fait | Client Supabase (aucune requête SQL écrite à la main dans l'appli). Les fonctions SQL n'exécutent pas de SQL construit à partir de texte. |
| 14 | Valider toutes les saisies | Fait | Règles dans `shared/` et mêmes bornes en base : 8.4. |
| 15 | Échapper le contenu des utilisateurs | Fait | React échappe tout ; aucun `dangerouslySetInnerHTML`. E-mails à l'admin en texte brut. |
| 16 | Restreindre les envois de fichiers | Fait | Taille, types et chemins limités ; photos d'objets réservées aux membres : 8.5. |
| 17 | Alléger les réponses de l'API | Fait | Colonnes choisies une à une dans `shared/db.ts`, et `email` illisible pour les voisins : 8.1. |
| 18 | Ajouter les en-têtes de sécurité | Fait | `vercel.json` (CSP, HSTS, nosniff, cadres interdits…) : 8.2. |
| 19 | Forcer HTTPS | Fait | Vercel et Supabase en HTTPS uniquement, HSTS sur 2 ans : 8.2. |
| 20 | Analyser les dépendances | Fait | `pnpm audit --prod` à chaque pull request, Dependabot chaque mois : 8.7. Reste à activer les alertes dans GitHub. |

## Liste de contrôle : 18 risques à vérifier avant le lancement

| # | Risque | État | Où / quoi |
|---|---|---|---|
| 1 | XSS | Faible | React échappe le texte, pas de HTML injecté, CSP sans script extérieur ni inline : 8.2. |
| 2 | CSRF | Sans objet | La connexion passe par un jeton envoyé dans l'en-tête, pas par un cookie. |
| 3 | Envois de fichiers dangereux | Faible | Images uniquement (pas de SVG), 2 Mo maximum, deux chemins autorisés, affichées en `<img>` : 8.5. |
| 4 | Accès à des fichiers hors de son dossier (« path traversal ») | Fait | Les règles de stockage n'autorisent l'écriture que dans le dossier du voisin. |
| 5 | Requêtes forcées vers d'autres serveurs (SSRF) | Fait | Seul appel sortant : `api.resend.com`, adresse fixe dans la base. |
| 6 | Réinitialisation de mot de passe défaillante | Sans objet | Pas de mot de passe. Vérifier que « Secure email change » est actif dans Supabase (8.7). |
| 7 | Gestion de session faible | Fait | Jeton court renouvelé automatiquement ; « Se déconnecter » ferme la session. |
| 8 | Secret JWT exposé | Fait | Géré par Supabase, jamais dans le code. |
| 9 | CORS trop permissif | Acceptable | L'API Supabase accepte toutes les origines par conception ; la protection vient de la RLS et du jeton. |
| 10 | Absence de limites | En partie | Demandes de résidence et messages d'Aide limités ; reste la connexion (tableau de bord) : 8.3. |
| 11 | Variables d'environnement exposées | Fait | Seules les variables `VITE_` (publiques) partent dans le navigateur. Vérifier Vercel : 8.7. |
| 12 | Identifiants par défaut | À vérifier | Double authentification et mots de passe des comptes : 8.7. |
| 13 | Webhooks non signés | Sans objet | Aucun webhook entrant. |
| 14 | Paiement vérifié seulement dans l'appli | Sans objet | Pas de paiement. Équivalent ici : les règles d'emprunt (objet disponible, pas le sien) sont vérifiées par la base. |
| 15 | Accès aux objets d'un autre (IDOR / BOLA) | Fait | RLS par résidence et par propriétaire, vérifiée par 75 contrôles à chaque pull request : 8.6. |
| 16 | Saisies acceptées sans contrôle | Fait | Bornes en base sur chaque champ libre : 8.4. |
| 17 | Journaux et détails d'erreur exposés | Fait | Les erreurs Supabase sont traduites en messages français, sans détail technique. |
| 18 | Cartes de source (source maps) exposées | Fait | Le build n'en produit pas (vérifié : aucun fichier `.map` dans `dist/`). |

---

## Total restant

Environ 6 demi-journées : phase 7 (2), phase 8 (2), phase 9 (2), plus le temps du pilote.
