import { Component, OnInit, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VARIANT_TYPES, entries } from '../../core/labels';
import { Variant, VariantRequest } from '../../core/models';

/** Creation / edition d'une edition d'un tome (collector, jaquette alternative...). */
@Component({
  selector: 'app-variant-form',
  imports: [FormsModule],
  template: `
    <form class="form-grid" (ngSubmit)="submit()" #form="ngForm">
      <label>
        Type
        <select name="type" [(ngModel)]="draft.type" required>
          @for (t of types; track t.value) {
            <option [ngValue]="t.value">{{ t.label }}</option>
          }
        </select>
      </label>
      <label class="wide">
        Nom
        <input name="name" [(ngModel)]="draft.name" required maxlength="300"
               placeholder="ex. Jaquette alternative Japan Expo 2026" />
      </label>
      <label>
        Éditeur
        <input name="publisher" [(ngModel)]="draft.publisher" maxlength="200" placeholder="ex. Ki-oon" />
      </label>
      <label>
        ISBN
        <input name="isbn" [(ngModel)]="draft.isbn" maxlength="20" />
      </label>
      <label>
        Date de sortie
        <input name="releaseDate" type="date" [(ngModel)]="draft.releaseDate" />
      </label>
      <label>
        Prix éditeur (€)
        <input name="price" type="number" min="0" step="0.01" [(ngModel)]="draft.price" />
      </label>
      <label>
        Tirage (exemplaires)
        <input name="printRun" type="number" min="1" [(ngModel)]="draft.printRun" />
      </label>
      <label class="full">
        Contenu bonus
        <input name="extras" [(ngModel)]="draft.extras" maxlength="2000"
               placeholder="ex. ex-libris numéroté, coffret, marque-page…" />
      </label>
      <label class="full">
        Description
        <textarea name="description" [(ngModel)]="draft.description" maxlength="4000"></textarea>
      </label>
      <div class="row full">
        <span class="spacer"></span>
        <button type="button" (click)="cancelled.emit()">Annuler</button>
        <button class="primary" type="submit" [disabled]="form.invalid || busy()">
          {{ variant() ? 'Enregistrer' : "Ajouter l'édition" }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .wide {
      grid-column: span 2;
    }
    @media (max-width: 520px) {
      .wide {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class VariantForm implements OnInit {
  readonly variant = input<Variant | null>(null);
  readonly busy = input(false);
  readonly saved = output<VariantRequest>();
  readonly cancelled = output<void>();

  protected readonly types = entries(VARIANT_TYPES);
  protected draft: VariantRequest = {
    type: 'COLLECTOR',
    name: '',
    publisher: null,
    isbn: null,
    releaseDate: null,
    price: null,
    printRun: null,
    description: null,
    extras: null,
  };

  ngOnInit() {
    const v = this.variant();
    if (v) {
      this.draft = {
        type: v.type,
        name: v.name,
        publisher: v.publisher,
        isbn: v.isbn,
        releaseDate: v.releaseDate,
        price: v.price,
        printRun: v.printRun,
        description: v.description,
        extras: v.extras,
      };
    }
  }

  protected submit() {
    const blankToNull = (s: string | null) => (s && s.trim() ? s.trim() : null);
    this.saved.emit({
      ...this.draft,
      name: this.draft.name.trim(),
      publisher: blankToNull(this.draft.publisher),
      isbn: blankToNull(this.draft.isbn),
      releaseDate: blankToNull(this.draft.releaseDate),
      description: blankToNull(this.draft.description),
      extras: blankToNull(this.draft.extras),
    });
  }
}
