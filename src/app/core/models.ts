// Miroir des DTO de l'API CultureShelf (/api/v1).

export type MediaKind = 'MANGA' | 'MANHWA' | 'MANHUA' | 'COMIC' | 'BD' | 'NOVEL' | 'OTHER';

export type VariantType =
  | 'STANDARD'
  | 'COLLECTOR'
  | 'LIMITED'
  | 'ALTERNATE_COVER'
  | 'REVERSIBLE_JACKET'
  | 'EVENT_EXCLUSIVE'
  | 'BOX_SET'
  | 'OTHER';

export type ImageKind = 'FRONT' | 'BACK' | 'SPINE' | 'REVERSE' | 'EXTRA' | 'OTHER';

export type CollectionStatus = 'OWNED' | 'PREORDERED' | 'WISHLIST';

export type ItemCondition = 'SEALED' | 'MINT' | 'VERY_GOOD' | 'GOOD' | 'FAIR' | 'DAMAGED';

export interface Provider {
  source: string;
  displayName: string;
}

export interface SearchResult {
  source: string;
  externalId: string;
  mediaKind: MediaKind;
  title: string;
  originalTitle: string | null;
  authors: string[];
  description: string | null;
  coverUrl: string | null;
  year: number | null;
  status: string | null;
  importedSeriesId: string | null;
}

export interface SeriesSummary {
  id: string;
  mediaKind: MediaKind;
  title: string;
  authors: string | null;
  coverUrl: string | null;
  volumeCount: number;
  ownedVolumes: number;
  ownedVariants: number;
  preorderedVariants: number;
  wishlistVariants: number;
}

export interface SeriesDetail {
  id: string;
  mediaKind: MediaKind;
  source: string | null;
  externalId: string | null;
  title: string;
  originalTitle: string | null;
  authors: string | null;
  description: string | null;
  coverUrl: string | null;
  year: number | null;
  status: string | null;
  volumes: Volume[];
}

export interface Volume {
  id: string;
  number: string;
  title: string | null;
  coverUrl: string | null;
  variants: Variant[];
}

export interface VolumeRequest {
  number: string;
  title?: string | null;
  coverUrl?: string | null;
}

export interface Variant {
  id: string;
  type: VariantType;
  name: string;
  publisher: string | null;
  isbn: string | null;
  releaseDate: string | null;
  price: number | null;
  printRun: number | null;
  description: string | null;
  extras: string | null;
  images: VariantImage[];
  collection: CollectionItem | null;
}

export interface VariantRequest {
  type: VariantType;
  name: string;
  publisher: string | null;
  isbn: string | null;
  releaseDate: string | null;
  price: number | null;
  printRun: number | null;
  description: string | null;
  extras: string | null;
}

export interface VariantImage {
  id: string;
  url: string;
  kind: ImageKind;
  caption: string | null;
}

export interface CollectionItem {
  id: string;
  variantId: string;
  status: CollectionStatus;
  condition: ItemCondition | null;
  quantity: number;
  acquiredAt: string | null;
  pricePaid: number | null;
  notes: string | null;
}

export interface CollectionItemRequest {
  status: CollectionStatus;
  condition: ItemCondition | null;
  quantity: number | null;
  acquiredAt: string | null;
  pricePaid: number | null;
  notes: string | null;
}

export interface CollectionEntry {
  item: CollectionItem;
  seriesId: string;
  seriesTitle: string;
  volumeId: string;
  volumeNumber: string;
  variantId: string;
  variantName: string;
  variantType: VariantType;
  coverUrl: string | null;
}
