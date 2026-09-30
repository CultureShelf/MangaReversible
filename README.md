# MangaReversible

Front Angular pour gérer sa collection de **mangas collector** : éditions limitées, jaquettes alternatives,
jaquettes réversibles, exclusivités salon, coffrets… avec leurs visuels.

Il s'appuie sur l'API générique [CultureShelf](../CultureShelfBack), qui combine le catalogue MangaDex
(séries, tomes, couvertures) et nos propres données collector.

## Fonctionnalités

- **Ajouter une série** : recherche dans MangaDex puis import en un clic. Les tomes et leurs couvertures
  (en français quand elles existent) sont créés automatiquement, avec une « Édition standard » par tome.
- **Ma collection** : étagère de séries avec progression (tomes possédés / parus), onglets Précommandes et Wishlist.
- **Page série** : grille des tomes (possédés en couleur, les autres atténués, ★ = éditions spéciales).
  Un clic sur un tome ouvre ses éditions :
  - ajout / modification d'une édition (type, éditeur, ISBN, date, prix, tirage, contenu bonus) ;
  - visuels uploadés ou par URL (couverture, dos, tranche, verso de jaquette, goodies), zoom plein écran ;
  - **« Retourner la jaquette »** quand un visuel « Verso de jaquette » est présent ;
  - statut dans la collection (Wishlist / Précommandé / Possédé) et détails de l'exemplaire
    (état, date, prix payé, quantité, notes).
- Ajout manuel de tomes absents du catalogue, resynchronisation avec MangaDex.

## Lancer en développement

Démarrer d'abord le back (http://localhost:8090), puis :

```bash
npm install
npm start
```

Ouvrir http://localhost:4200. L'URL de l'API se règle dans `src/environments/environment*.ts`
(le front doit aussi être autorisé côté back : `cultureshelf.cors.allowed-origins`).

## Build et Docker

```bash
npm run build            # dist/MangaReversible/browser
docker build -t manga-reversible .
docker run -p 4200:80 manga-reversible
```

## Tests

```bash
npm test
```

## Structure

```
src/app/
  core/        modèles (miroir des DTO), ApiService, libellés FR, pipe imgUrl
  pages/
    collection/  étagère + précommandes + wishlist
    search/      recherche et import depuis le catalogue externe
    series/      détail d'une série, cartes d'édition (variant-card) et formulaire (variant-form)
```
