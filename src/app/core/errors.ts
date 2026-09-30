import { HttpErrorResponse } from '@angular/common/http';

/** Message lisible a partir d'une erreur HTTP (le back renvoie des problem+json). */
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return "Impossible de joindre l'API CultureShelf. Le back est-il démarré ?";
    }
    const detail = error.error?.detail;
    return typeof detail === 'string' ? detail : `Erreur ${error.status}`;
  }
  return 'Erreur inattendue';
}
