import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { ImgUrlPipe } from '../../core/img-url.pipe';
import { VARIANT_TYPES } from '../../core/labels';
import { CollectionEntry, CollectionStatus, SeriesSummary } from '../../core/models';

type Tab = 'series' | 'PREORDERED' | 'WISHLIST';

@Component({
  selector: 'app-collection-page',
  imports: [RouterLink, ImgUrlPipe],
  templateUrl: './collection-page.html',
  styleUrl: './collection-page.css',
})
export class CollectionPage {
  private readonly api = inject(ApiService);

  protected readonly variantTypes = VARIANT_TYPES;
  protected readonly tab = signal<Tab>('series');
  protected readonly filter = signal('');
  protected readonly series = signal<SeriesSummary[] | null>(null);
  protected readonly entries = signal<CollectionEntry[] | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly filteredSeries = computed(() => {
    const q = this.filter().trim().toLowerCase();
    const all = this.series() ?? [];
    return q ? all.filter((s) => `${s.title} ${s.authors ?? ''}`.toLowerCase().includes(q)) : all;
  });

  protected readonly stats = computed(() => {
    const all = this.series() ?? [];
    return {
      series: all.length,
      ownedVolumes: all.reduce((n, s) => n + s.ownedVolumes, 0),
      ownedVariants: all.reduce((n, s) => n + s.ownedVariants, 0),
      preordered: all.reduce((n, s) => n + s.preorderedVariants, 0),
      wishlist: all.reduce((n, s) => n + s.wishlistVariants, 0),
    };
  });

  constructor() {
    this.api.listSeries().subscribe({
      next: (series) => this.series.set(series),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  protected selectTab(tab: Tab) {
    this.tab.set(tab);
    if (tab !== 'series') {
      this.entries.set(null);
      this.api.collection(tab as CollectionStatus).subscribe({
        next: (entries) => this.entries.set(entries),
        error: (e) => this.error.set(errorMessage(e)),
      });
    }
  }

  protected progress(s: SeriesSummary): number {
    return s.volumeCount ? Math.round((100 * s.ownedVolumes) / s.volumeCount) : 0;
  }
}
