# Tests

## Tests automatiques

Lancés par GitHub Actions (« Vérifier ») à chaque pull request et à chaque merge dans `main`. À lancer aussi avant chaque commit.

| Commande            | Ce qu'elle vérifie                                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`    | Les types TypeScript de tout le projet.                                                                                                      |
| `pnpm test`         | Les règles de `shared/` (Vitest), un fichier `*.spec.ts` à côté de chaque fichier.                                                           |
| `pnpm test:db`      | L'isolation entre résidences : toutes les migrations sur un Postgres jetable, puis 75 contrôles (`supabase/tests/`, voir `03-technical.md`). |
| `pnpm build`        | Le build de production (`dist/spa`).                                                                                                         |
| `pnpm audit --prod` | Les failles connues dans ce qui part dans le navigateur (`dependencies`).                                                                    |

Ce que couvrent les tests de `shared/` aujourd'hui : connexion et adresse mémorisée, demandes d'emprunt, conversions de la base (`db.ts`), cache des liens de photos, références de logement `X-Nn`, nouvel objet, profil, demande de résidence, résidence et Aide, « Je cherche ».

Règles :

- Toute nouvelle règle dans `shared/` a son test.
- Toute nouvelle table ou règle de sécurité ajoute ses contrôles dans `supabase/tests/isolation.sql` : ce qu'un voisin d'une autre résidence ne peut pas faire, et ce que le propriétaire peut toujours faire.
- Un test qui a besoin d'un navigateur va dans les contrôles à la main ci-dessous.

## Contrôles à la main, par largeur

Sur la prévisualisation Vercel de la pull request, connecté avec un compte de test, dans le mode « appareil » des outils de développement du navigateur :

| Largeur   | Rôle                                         |
| --------- | -------------------------------------------- |
| 360 x 800 | Largeur de référence. À vérifier en premier. |
| 375       | iPhone courant.                              |
| 430       | Grand téléphone.                             |

Pour chaque largeur :

- [ ] Aucun défilement horizontal, sur aucune page (J'emprunte, fiche objet, Je cherche, Je prête, Demandes, Profil, Aide).
- [ ] L'en-tête (nom et adresse de la résidence) ne déborde pas.
- [ ] Les cartes d'objets restent sur deux colonnes égales ; un titre long est coupé à deux lignes.
- [ ] Le champ « Rechercher un objet… » a un texte d'au moins 16 px (sinon iOS zoome).
- [ ] La barre d'onglets est entière, le bouton « Je prête » n'est pas coupé.
- [ ] Sur une fiche objet, le bouton « Demander à emprunter » (ou « Je le veux » pour un don) reste accessible en faisant défiler et ne cache pas la barre d'onglets.
- [ ] Un objet déjà emprunté affiche « Emprunté en ce moment » et le bouton est désactivé.
- [ ] Les photos de la fiche défilent d'un glissement de doigt, une photo à la fois.
- [ ] `/items/nexiste-pas` affiche « Objet introuvable » avec le lien « Retour aux objets ».
- [ ] Chaque onglet ouvre une page ; une adresse inconnue affiche la page introuvable, avec « Retour aux objets ».
- [ ] Le bouton retour du téléphone ramène à la page précédente.

## Écran d'accueil

- [ ] iPhone (Safari) : Partager → « Sur l'écran d'accueil ». L'icône est le logo sur fond vert, le nom « Voisin ».
- [ ] Android (Chrome) : menu ⋮ → « Ajouter à l'écran d'accueil » (ou « Installer l'appli »). L'icône n'est pas coupée dans le rond.
- [ ] Ouverte depuis l'icône, l'appli s'affiche sans barre d'adresse, et la session reste ouverte.
- [ ] Un lien de connexion reçu par e-mail ouvre bien l'appli et connecte le voisin.

## Encoche et barre du bas

- Ouvrir la prévisualisation sur un iPhone avec encoche (ou l'appareil correspondant dans les outils de développement).
- L'en-tête est sous la barre d'état, la barre d'onglets au-dessus de la barre d'accueil.
- En paysage, rien d'important n'est caché.

## Accessibilité

- [ ] Tout texte visible est en français, y compris les `aria-label` et les messages d'erreur.
- [ ] Espace insécable (U+00A0) avant « ? », « ! », « : », « ; » et à l'intérieur de « ». Le test `client/lib/typography.spec.ts` le vérifie dans les chaînes ; le texte écrit directement dans le JSX se vérifie à l'œil.
- [ ] Chaque page a un seul `h1`, et les titres ne sautent pas de niveau.
- [ ] Les boutons sans texte (icônes) ont un `aria-label`.
- [ ] Le contour de focus est visible en naviguant au clavier (Tab).
- [ ] Les contrastes respectent WCAG AA ; un statut (« En attente », « Acceptée »…) est écrit, pas seulement en couleur.
- [ ] Avec VoiceOver (iPhone) ou TalkBack (Android) : l'accueil et le parcours d'emprunt se suivent à l'oreille.

## Performance

- `pnpm build` : noter la taille du fichier JavaScript principal (Vite l'affiche). Viser moins de 200 Ko compressé.
- Lighthouse dans Chrome sur `voisin-mu.vercel.app`, en mode mobile : viser plus de 85 en performance.

## Pilote

Avant d'élargir le pilote, demander à un voisin de faire seul, sur son téléphone :

1. Trouver une perceuse avec « Rechercher un objet… ».
2. Ouvrir sa fiche et lire son état.
3. Demander à l'emprunter, puis suivre la demande dans l'onglet Demandes.
4. Prêter un objet avec une photo (« Je prête »).
5. Retirer cet objet.
6. Publier un « Je cherche », puis le retrouver dans la liste.

Noter chaque hésitation. Corriger les trois premiers problèmes avant d'inviter plus de voisins.

## Signaler un bug

```
Page :
Largeur et téléphone :
Étapes :
Attendu :
Obtenu :
Capture :
```
