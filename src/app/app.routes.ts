import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Ma collection — MangaReversible',
    loadComponent: () => import('./pages/collection/collection-page').then((m) => m.CollectionPage),
  },
  {
    path: 'search',
    title: 'Ajouter une série — MangaReversible',
    loadComponent: () => import('./pages/search/search-page').then((m) => m.SearchPage),
  },
  {
    path: 'series/:id',
    title: 'Série — MangaReversible',
    loadComponent: () => import('./pages/series/series-page').then((m) => m.SeriesPage),
  },
  { path: '**', redirectTo: '' },
];
