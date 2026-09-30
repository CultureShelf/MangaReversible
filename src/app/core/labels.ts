import { CollectionStatus, ImageKind, ItemCondition, VariantType } from './models';

export const VARIANT_TYPES: Record<VariantType, string> = {
  STANDARD: 'Standard',
  COLLECTOR: 'Collector',
  LIMITED: 'Édition limitée',
  ALTERNATE_COVER: 'Jaquette alternative',
  REVERSIBLE_JACKET: 'Jaquette réversible',
  EVENT_EXCLUSIVE: 'Exclusivité salon / boutique',
  BOX_SET: 'Coffret',
  OTHER: 'Autre',
};

export const IMAGE_KINDS: Record<ImageKind, string> = {
  FRONT: 'Couverture',
  BACK: 'Dos',
  SPINE: 'Tranche',
  REVERSE: 'Verso de jaquette',
  EXTRA: 'Goodies',
  OTHER: 'Autre',
};

export const COLLECTION_STATUSES: Record<CollectionStatus, string> = {
  OWNED: 'Possédé',
  PREORDERED: 'Précommandé',
  WISHLIST: 'Wishlist',
};

export const CONDITIONS: Record<ItemCondition, string> = {
  SEALED: 'Sous blister',
  MINT: 'Neuf',
  VERY_GOOD: 'Très bon état',
  GOOD: 'Bon état',
  FAIR: 'État moyen',
  DAMAGED: 'Abîmé',
};

export function entries<K extends string>(labels: Record<K, string>): { value: K; label: string }[] {
  return (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));
}
