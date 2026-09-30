import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { ImgUrlPipe } from '../../core/img-url.pipe';
import { CollectionStatus, SeriesDetail, Variant, VariantRequest, Volume } from '../../core/models';
import { VariantCard } from './variant-card';
import { VariantForm } from './variant-form';

@Component({
  selector: 'app-series-page',
  imports: [FormsModule, ImgUrlPipe, VariantCard, VariantForm],
  templateUrl: './series-page.html',
  styleUrl: './series-page.css',
  host: { '(document:keydown.escape)': 'closeVolume()' },
})
export class SeriesPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  /** Parametre de route :id */
  readonly id = input.required<string>();
  /** Query param ?volume= : ouvre directement un tome */
  readonly volume = input<string | undefined>();

  protected readonly series = signal<SeriesDetail | null>(null);
  protected readonly selectedVolumeId = signal<string | null>(null);
  protected readonly addingVariant = signal(false);
  protected readonly addingVolume = signal(false);
  protected readonly showDescription = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected newVolumeNumber = '';

  protected readonly selectedVolume = computed(
    () => this.series()?.volumes.find((v) => v.id === this.selectedVolumeId()) ?? null,
  );

  protected readonly stats = computed(() => {
    const volumes = this.series()?.volumes ?? [];
    return {
      volumes: volumes.length,
      owned: volumes.filter((v) => this.volumeStatus(v) === 'OWNED').length,
      collectorEditions: volumes.reduce((n, v) => n + v.variants.filter((x) => x.type !== 'STANDARD').length, 0),
    };
  });

  constructor() {
    effect(() => {
      const id = this.id();
      this.series.set(null);
      this.error.set(null);
      this.api.getSeries(id).subscribe({
        next: (series) => {
          this.series.set(series);
          this.selectedVolumeId.set(this.volume() ?? null);
        },
        error: (e) => this.error.set(errorMessage(e)),
      });
    });
  }

  /** Meilleur statut parmi les editions du tome. */
  protected volumeStatus(volume: Volume): CollectionStatus | null {
    const statuses = volume.variants.map((v) => v.collection?.status);
    return (['OWNED', 'PREORDERED', 'WISHLIST'] as const).find((s) => statuses.includes(s)) ?? null;
  }

  protected volumeCover(volume: Volume): string | null {
    const owned = volume.variants.find((v) => v.collection?.status === 'OWNED' && v.images.length);
    return owned?.images[0].url ?? volume.coverUrl;
  }

  protected collectorCount(volume: Volume): number {
    return volume.variants.filter((v) => v.type !== 'STANDARD').length;
  }

  protected openVolume(volume: Volume) {
    this.selectedVolumeId.set(volume.id);
    this.addingVariant.set(false);
  }

  protected closeVolume() {
    this.selectedVolumeId.set(null);
    this.addingVariant.set(false);
  }

  protected onVariantChanged(volumeId: string, variant: Variant) {
    this.patchVolume(volumeId, (vol) => ({
      ...vol,
      variants: vol.variants.map((v) => (v.id === variant.id ? variant : v)),
    }));
  }

  protected onVariantDeleted(volumeId: string, variantId: string) {
    this.patchVolume(volumeId, (vol) => ({ ...vol, variants: vol.variants.filter((v) => v.id !== variantId) }));
  }

  protected createVariant(volumeId: string, request: VariantRequest) {
    this.run(this.api.createVariant(volumeId, request), (variant) => {
      this.addingVariant.set(false);
      this.patchVolume(volumeId, (vol) => ({ ...vol, variants: [...vol.variants, variant] }));
    });
  }

  protected addVolume() {
    const number = this.newVolumeNumber.trim();
    const series = this.series();
    if (!number || !series) {
      return;
    }
    this.run(this.api.addVolume(series.id, { number }), () => {
      this.newVolumeNumber = '';
      this.addingVolume.set(false);
      this.reload();
    });
  }

  protected deleteVolume(volume: Volume) {
    if (confirm(`Supprimer le tome ${volume.number} et toutes ses éditions ?`)) {
      this.run(this.api.deleteVolume(volume.id), () => {
        this.closeVolume();
        this.reload();
      });
    }
  }

  protected refresh() {
    this.run(this.api.refreshSeries(this.id()), (series) => this.series.set(series));
  }

  protected deleteSeries() {
    const series = this.series();
    if (series && confirm(`Retirer « ${series.title} » de l'étagère, avec toutes vos éditions et visuels ?`)) {
      this.run(this.api.deleteSeries(series.id), () => this.router.navigate(['/']));
    }
  }

  private reload() {
    this.api.getSeries(this.id()).subscribe({
      next: (series) => this.series.set(series),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  private patchVolume(volumeId: string, patch: (volume: Volume) => Volume) {
    this.series.update((s) => s && { ...s, volumes: s.volumes.map((v) => (v.id === volumeId ? patch(v) : v)) });
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
