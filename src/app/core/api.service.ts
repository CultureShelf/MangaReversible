import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  CollectionEntry,
  CollectionItem,
  CollectionItemRequest,
  CollectionStatus,
  ImageKind,
  Provider,
  SearchResult,
  SeriesDetail,
  SeriesSummary,
  Variant,
  VariantRequest,
  Volume,
  VolumeRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1`;

  // --- Catalogue externe
  providers() {
    return this.http.get<Provider[]>(`${this.base}/catalog/providers`);
  }

  search(source: string, q: string) {
    const params = new HttpParams().set('source', source).set('q', q);
    return this.http.get<SearchResult[]>(`${this.base}/catalog/search`, { params });
  }

  importSeries(source: string, externalId: string) {
    return this.http.post<SeriesDetail>(`${this.base}/series/import`, { source, externalId });
  }

  // --- Series et tomes
  listSeries() {
    return this.http.get<SeriesSummary[]>(`${this.base}/series`);
  }

  getSeries(id: string) {
    return this.http.get<SeriesDetail>(`${this.base}/series/${id}`);
  }

  refreshSeries(id: string) {
    return this.http.post<SeriesDetail>(`${this.base}/series/${id}/refresh`, null);
  }

  deleteSeries(id: string) {
    return this.http.delete<void>(`${this.base}/series/${id}`);
  }

  addVolume(seriesId: string, request: VolumeRequest) {
    return this.http.post<Volume>(`${this.base}/series/${seriesId}/volumes`, request);
  }

  deleteVolume(id: string) {
    return this.http.delete<void>(`${this.base}/volumes/${id}`);
  }

  // --- Variantes collector et visuels
  createVariant(volumeId: string, request: VariantRequest) {
    return this.http.post<Variant>(`${this.base}/volumes/${volumeId}/variants`, request);
  }

  updateVariant(id: string, request: VariantRequest) {
    return this.http.put<Variant>(`${this.base}/variants/${id}`, request);
  }

  deleteVariant(id: string) {
    return this.http.delete<void>(`${this.base}/variants/${id}`);
  }

  uploadImage(variantId: string, file: File, kind: ImageKind, caption?: string) {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    if (caption) {
      form.append('caption', caption);
    }
    return this.http.post<Variant>(`${this.base}/variants/${variantId}/images`, form);
  }

  addImageUrl(variantId: string, url: string, kind: ImageKind, caption?: string) {
    return this.http.post<Variant>(`${this.base}/variants/${variantId}/images`, { url, kind, caption });
  }

  deleteImage(id: string) {
    return this.http.delete<Variant>(`${this.base}/images/${id}`);
  }

  // --- Collection
  collection(status?: CollectionStatus) {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<CollectionEntry[]>(`${this.base}/collection`, { params });
  }

  setCollection(variantId: string, request: CollectionItemRequest) {
    return this.http.put<CollectionItem>(`${this.base}/collection/variants/${variantId}`, request);
  }

  removeFromCollection(variantId: string) {
    return this.http.delete<void>(`${this.base}/collection/variants/${variantId}`);
  }
}
