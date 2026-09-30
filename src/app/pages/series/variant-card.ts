import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { ImgUrlPipe } from '../../core/img-url.pipe';
import { COLLECTION_STATUSES, CONDITIONS, IMAGE_KINDS, VARIANT_TYPES, entries } from '../../core/labels';
import { CollectionItemRequest, CollectionStatus, ImageKind, Variant, VariantRequest } from '../../core/models';
import { VariantForm } from './variant-form';

/** Une edition d'un tome : visuels, infos collector et etat dans la collection. */
@Component({
  selector: 'app-variant-card',
  imports: [FormsModule, CurrencyPipe, DatePipe, ImgUrlPipe, VariantForm],
  templateUrl: './variant-card.html',
  styleUrl: './variant-card.css',
  host: { '(document:keydown.escape)': 'zoomed.set(null)' },
})
export class VariantCard {
  private readonly api = inject(ApiService);

  readonly variant = input.required<Variant>();
  /** Couverture du tome, affichee si l'edition n'a pas encore de visuel. */
  readonly fallbackCover = input<string | null>(null);
  readonly changed = output<Variant>();
  readonly deleted = output<void>();

  protected readonly variantTypes = VARIANT_TYPES;
  protected readonly imageKinds = IMAGE_KINDS;
  protected readonly imageKindOptions = entries(IMAGE_KINDS);
  protected readonly statuses = entries(COLLECTION_STATUSES);
  protected readonly conditions = entries(CONDITIONS);
  protected readonly conditionLabels = CONDITIONS;

  protected readonly selectedImage = signal(0);
  protected readonly flipped = signal(false);
  protected readonly zoomed = signal<string | null>(null);
  protected readonly editing = signal(false);
  protected readonly addingImage = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected imageDraft: { kind: ImageKind; url: string; caption: string; file: File | null } = this.emptyImageDraft();
  protected itemDraft: CollectionItemRequest | null = null;

  protected readonly current = computed(() => {
    const images = this.variant().images;
    return images[Math.min(this.selectedImage(), images.length - 1)] ?? null;
  });

  /** Jaquette reversible : le verso s'affiche en retournant le visuel principal. */
  protected readonly reverse = computed(() => this.variant().images.find((i) => i.kind === 'REVERSE') ?? null);
  protected readonly front = computed(() => this.variant().images.find((i) => i.kind !== 'REVERSE') ?? null);

  protected setStatus(status: CollectionStatus | null) {
    const current = this.variant().collection;
    if ((current?.status ?? null) === status) {
      return;
    }
    if (status === null) {
      this.run(this.api.removeFromCollection(this.variant().id), () =>
        this.changed.emit({ ...this.variant(), collection: null }),
      );
      return;
    }
    const request: CollectionItemRequest = {
      status,
      condition: current?.condition ?? null,
      quantity: current?.quantity ?? 1,
      acquiredAt: current?.acquiredAt ?? (status === 'OWNED' ? new Date().toISOString().slice(0, 10) : null),
      pricePaid: current?.pricePaid ?? null,
      notes: current?.notes ?? null,
    };
    this.run(this.api.setCollection(this.variant().id, request), (collection) =>
      this.changed.emit({ ...this.variant(), collection }),
    );
  }

  protected editItem() {
    const c = this.variant().collection;
    if (c) {
      this.itemDraft = {
        status: c.status,
        condition: c.condition,
        quantity: c.quantity,
        acquiredAt: c.acquiredAt,
        pricePaid: c.pricePaid,
        notes: c.notes,
      };
    }
  }

  protected saveItem() {
    if (!this.itemDraft) {
      return;
    }
    this.run(this.api.setCollection(this.variant().id, this.itemDraft), (collection) => {
      this.itemDraft = null;
      this.changed.emit({ ...this.variant(), collection });
    });
  }

  protected save(request: VariantRequest) {
    this.run(this.api.updateVariant(this.variant().id, request), (variant) => {
      this.editing.set(false);
      this.changed.emit(variant);
    });
  }

  protected remove() {
    if (confirm(`Supprimer l'édition « ${this.variant().name} » et ses visuels ?`)) {
      this.run(this.api.deleteVariant(this.variant().id), () => this.deleted.emit());
    }
  }

  protected onFile(event: Event) {
    this.imageDraft.file = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  protected addImage() {
    const { file, url, kind, caption } = this.imageDraft;
    const request = file
      ? this.api.uploadImage(this.variant().id, file, kind, caption)
      : this.api.addImageUrl(this.variant().id, url.trim(), kind, caption);
    this.run(request, (variant) => {
      this.addingImage.set(false);
      this.imageDraft = this.emptyImageDraft();
      this.selectedImage.set(variant.images.length - 1);
      this.changed.emit(variant);
    });
  }

  protected removeImage(id: string) {
    if (confirm('Supprimer ce visuel ?')) {
      this.run(this.api.deleteImage(id), (variant) => {
        this.selectedImage.set(0);
        this.changed.emit(variant);
      });
    }
  }

  private emptyImageDraft() {
    return { kind: 'FRONT' as ImageKind, url: '', caption: '', file: null };
  }

  private run<T>(request: Observable<T>, onSuccess: (value: T) => void) {
    this.busy.set(true);
    this.error.set(null);
    request.subscribe({
      next: (value) => {
        this.busy.set(false);
        onSuccess(value);
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
}
