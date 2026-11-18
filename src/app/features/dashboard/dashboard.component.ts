import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiHealth } from '../../core/models/clothing-recommendation.model';
import { FortyGuardService } from '../../core/services/fortyguard.service';

@Component({
  selector: 'fg-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="eyebrow"><span class="status-dot"></span> ENVIRONMENTAL INTELLIGENCE</div>
      <div class="intro">
        <div>
          <h1>Explore your environment.</h1>
          <p>Location-aware insight from FortyGuard, with data integrity at the center.</p>
        </div>
        <span class="date-chip">{{ today }}</span>
      </div>
      <section class="connection-card" aria-live="polite">
        <div class="connection-icon">↗</div>
        <div class="connection-copy">
          <h2>FortyGuard connection</h2>
          @if (loading) {
            <p>Checking API connection…</p>
          } @else if (health?.fortyGuard === 'configured') {
            <p><span class="status-dot"></span> API configured</p>
          } @else if (error) {
            <p class="muted">Backend unavailable. Check that the API service is running.</p>
          } @else {
            <p class="muted">Live analysis is not enabled. No environmental values are being displayed.</p>
          }
        </div>
        <span class="connection-state">{{ health?.fortyGuard === 'configured' ? 'READY' : 'SETUP REQUIRED' }}</span>
      </section>
      <div class="section-heading">
        <div><h2>Your workspace</h2><p>Choose an insight to get started.</p></div>
      </div>
      <div class="feature-grid">
        <a class="feature-card primary-card" routerLink="/recommendations">
          <div class="feature-top">
            <span class="feature-icon outfit-icon" aria-hidden="true">♧</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </div>
          <p class="feature-kicker">PERSONAL WEATHER GUIDE</p>
          <h3>What Should I Wear?</h3>
          <p class="feature-description">Get practical clothing suggestions based on FortyGuard conditions for a place and time.</p>
          <span class="text-link">Plan what to wear <span aria-hidden="true">→</span></span>
        </a>
        <article class="feature-card pending-card">
          <div class="feature-top">
            <span class="feature-icon analysis-icon" aria-hidden="true">⌁</span>
            <span class="coming-soon">AVAILABLE VIA API</span>
          </div>
          <p class="feature-kicker">PLACE-BASED INSIGHTS</p>
          <h3>Environmental analysis</h3>
          <p class="feature-description">Explore verified environmental parameters for a location. Values appear only when returned by FortyGuard.</p>
          <span class="text-link quiet">No recent analyses</span>
        </article>
      </div>
      <aside class="integrity-note">
        <span aria-hidden="true">ⓘ</span>
        <p><strong>Honest by design.</strong> Measurements and dashboard statistics appear only when provided by the configured FortyGuard API.</p>
      </aside>
    </section>
  `,
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly fortyGuard = inject(FortyGuardService);
  readonly today = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date());
  health: ApiHealth | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.fortyGuard.getHealth().subscribe({
      next: (health) => { this.health = health; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
}
