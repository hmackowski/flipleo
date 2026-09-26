import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 * A summary number at the top of a page ("Total Profit $51.25").
 * <app-stat-tile label="Total Profit" [value]="..." hint="2 sold" icon="payments" tone="success" />
 */
@Component({
  selector: 'app-stat-tile',
  imports: [MatIcon],
  template: `
    <div class="tile" [attr.data-tone]="tone()">
      <div class="icon"><mat-icon>{{ icon() }}</mat-icon></div>
      <div class="text">
        <span class="label">{{ label() }}</span>
        <span class="value">{{ value() }}</span>
        @if (hint()) {
          <span class="hint">{{ hint() }}</span>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .tile {
      display: flex; align-items: center; gap: 14px; height: 100%; box-sizing: border-box;
      padding: 18px 20px; border: 1px solid var(--fl-border); border-radius: var(--fl-radius);
      background: var(--fl-surface); box-shadow: var(--fl-shadow);
    }
    .icon {
      display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px;
      background: var(--fl-surface-muted); color: var(--fl-text-muted);
    }
    .text { display: flex; flex-direction: column; min-width: 0; }
    .label { font-size: 0.8rem; font-weight: 600; color: var(--fl-text-muted); }
    .value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--fl-text); line-height: 1.25; }
    .hint { font-size: 0.78rem; color: var(--fl-text-faint); }
    [data-tone='success'] .icon { background: var(--fl-success-soft); color: var(--fl-success); }
    [data-tone='success'] .value { color: var(--fl-success); }
    [data-tone='danger'] .icon { background: var(--fl-danger-soft); color: var(--fl-danger); }
    [data-tone='danger'] .value { color: var(--fl-danger); }
    [data-tone='warning'] .icon { background: var(--fl-warning-soft); color: var(--fl-warning); }
    [data-tone='info'] .icon { background: var(--fl-info-soft); color: var(--fl-info); }
    [data-tone='brand'] .icon { background: var(--fl-primary-soft); color: var(--fl-primary); }
  `,
})
export class StatTileComponent {
  label = input.required<string>();
  value = input.required<string>();
  hint = input<string | null>(null);
  icon = input('insights');
  tone = input<'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'brand'>('neutral');
}
