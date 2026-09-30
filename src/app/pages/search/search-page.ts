import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { ImgUrlPipe } from '../../core/img-url.pipe';
import { Provider, SearchResult } from '../../core/models';

@Component({
  selector: 'app-search-page',
  imports: [RouterLink, ImgUrlPipe],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  protected readonly providers = signal<Provider[]>([]);
  protected readonly source = signal('MANGADEX');
  protected readonly query = signal('');
  protected readonly results = signal<SearchResult[] | null>(null);
  protected readonly loading = signal(false);
  protected readonly importing = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.api.providers().subscribe({
      next: (providers) => {
        this.providers.set(providers);
        if (providers.length && !providers.some((p) => p.source === this.source())) {
          this.source.set(providers[0].source);
        }
      },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  protected search(event?: Event) {
    event?.preventDefault();
    const q = this.query().trim();
    if (!q) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.search(this.source(), q).subscribe({
      next: (results) => {
        this.results.set(results);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.loading.set(false);
      },
    });
  }

  protected import(result: SearchResult) {
    this.importing.set(result.externalId);
    this.error.set(null);
    this.api.importSeries(result.source, result.externalId).subscribe({
      next: (series) => this.router.navigate(['/series', series.id]),
      error: (e) => {
        this.error.set(errorMessage(e));
        this.importing.set(null);
      },
    });
  }
}
