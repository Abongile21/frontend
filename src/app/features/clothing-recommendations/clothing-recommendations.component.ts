import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { ApiHealth, ClothingRecommendation, LocationResult } from '../../core/models/clothing-recommendation.model';
import { FortyGuardService } from '../../core/services/fortyguard.service';

@Component({
  selector: 'fg-clothing-recommendations',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="page">
      <a class="back-link" href="/" aria-label="Back to dashboard">← <span>Dashboard</span></a>
      <div class="page-heading">
        <div>
          <p class="eyebrow">PERSONAL WEATHER GUIDE</p>
          <h1>What Should I Wear?</h1>
          <p class="subtitle">Thoughtful clothing suggestions, grounded in FortyGuard environmental conditions.</p>
        </div>
        <span class="clothes-illustration" aria-hidden="true">🧥</span>
      </div>

      <section class="source-banner" aria-live="polite">
        <span class="source-mark" aria-hidden="true">✓</span>
        <div>
          <strong>FortyGuard data only</strong>
          @if (loadingHealth) {
            <p>Checking connection…</p>
          } @else if (health?.fortyGuard === 'configured') {
            <p>Backend configured. Submit a location and time for analysis.</p>
          } @else {
            <p>Live analysis is not enabled. No weather or clothing advice will be fabricated.</p>
          }
        </div>
      </section>

      <div class="content-grid">
        <section class="form-card">
          <div class="card-title">
            <span class="step">01</span>
            <div><h2>Choose a place and time</h2><p>Enter coordinates or use your device location.</p></div>
          </div>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <label for="location">Destination or city</label>
            <input id="location" type="text" formControlName="location" placeholder="e.g. Austin, Texas" autocomplete="off">
            @if (searchingLocations) { <p class="field-hint">Searching destinations…</p> }
            @if (locationResults.length) {
              <div class="location-results" role="listbox" aria-label="Destination results">
                @for (result of locationResults; track result.latitude + ':' + result.longitude) {
                  <button type="button" role="option" (click)="selectLocation(result)">
                    <strong>{{ result.name }}</strong>
                    <span>{{ result.latitude.toFixed(4) }}, {{ result.longitude.toFixed(4) }}</span>
                  </button>
                }
              </div>
            }
            <div class="coordinate-row">
              <div>
                <label for="latitude">Latitude</label>
                <input id="latitude" type="number" formControlName="latitude" step="any" placeholder="-33.9">
              </div>
              <div>
                <label for="longitude">Longitude</label>
                <input id="longitude" type="number" formControlName="longitude" step="any" placeholder="18.4">
              </div>
            </div>
            <button type="button" class="location-button" (click)="useCurrentLocation()" [disabled]="locating">
              <span aria-hidden="true">◎</span> {{ locating ? 'Finding location…' : 'Use my current location' }}
            </button>
            @if (locationError) { <p class="field-error" role="alert">{{ locationError }}</p> }

            <div class="time-row">
              <div>
                <label for="date">Date</label>
                <input id="date" type="date" formControlName="startDate">
              </div>
              <div>
                <label for="start-time">From</label>
                <input id="start-time" type="time" formControlName="startTime">
              </div>
              <div>
                <label for="end-time">Until <span class="optional">(optional)</span></label>
                <input id="end-time" type="time" formControlName="endTime">
              </div>
            </div>

            <label for="temperature">FortyGuard temperature (°C)</label>
            <input id="temperature" type="number" formControlName="temperatureCelsius" step="any" placeholder="Required by the documented API">
            <p class="field-hint">The FortyGuard environmental-parameters endpoint requires a temperature input. Use a value from a verified FortyGuard result; this is not fetched or inferred by the app.</p>

            <button class="submit-button" type="submit" [disabled]="form.invalid || submitting || health?.fortyGuard !== 'configured'">
              @if (submitting) { Analyzing conditions… } @else { Get clothing recommendations <span aria-hidden="true">→</span> }
            </button>
            @if (health?.fortyGuard !== 'configured' && !loadingHealth) {
              <p class="disabled-note">Recommendations are unavailable while the FortyGuard response mapping is unverified.</p>
            }
          </form>
        </section>

        <section class="result-card" aria-live="polite">
          @if (submitting) {
            <div class="empty-state"><span class="sun-icon">◌</span><h2>Checking conditions</h2><p>Waiting for environmental data from FortyGuard…</p></div>
          } @else if (errorMessage) {
            <div class="error-state" role="alert"><span class="error-icon">!</span><h2>We couldn't complete the analysis</h2><p>{{ errorMessage }}</p></div>
          } @else {
            @if (recommendation; as result) {
              <div class="result-heading"><div><p class="eyebrow">YOUR WEATHER SNAPSHOT</p><h2>{{ result.location }}</h2></div><span class="data-source">FORTYGUARD</span></div>
              <div class="temperature-row">
                <span class="temperature">{{ result.observation.temperatureCelsius === null ? '—' : result.observation.temperatureCelsius + '°' }}</span>
                <div><strong>Current temperature</strong><p>Feels like {{ result.observation.feelsLikeCelsius === null ? 'not available' : result.observation.feelsLikeCelsius + '°C' }}</p></div>
              </div>
              <div class="recommendation-section">
                <h3><span aria-hidden="true">👕</span> Recommended clothing</h3>
                @for (item of result.clothing; track item) { <p class="recommendation-item">{{ item }}</p> }
              </div>
              <div class="recommendation-section">
                <h3><span aria-hidden="true">👟</span> Suggested footwear</h3>
                @for (item of result.footwear; track item) { <p class="recommendation-item">{{ item }}</p> }
              </div>
              @if (result.advice.length) {
                <div class="recommendation-section"><h3>Weather advice</h3>
                  @for (item of result.advice; track item) { <p class="detail-item">{{ item }}</p> }
                </div>
              }
              @if (result.explanations.length) {
                <div class="why-section"><h3>Why these recommendations?</h3>
                  @for (item of result.explanations; track item) { <p class="detail-item">{{ item }}</p> }
                </div>
              }
            } @else {
              <div class="empty-state">
                <span class="sun-icon" aria-hidden="true">☼</span>
                <h2>Your recommendation will appear here</h2>
                <p>Choose a location and time. Suggestions will be based only on environmental measurements returned by FortyGuard.</p>
                <div class="weather-chips"><span>Temperature</span><span>Humidity</span><span>Rain</span><span>Sun</span></div>
              </div>
            }
          }
        </section>
      </div>
      <p class="page-footnote">Rule-based guidance, not a forecast or medical advice. Unavailable measurements are shown as unavailable.</p>
    </section>
  `,
  styleUrl: './clothing-recommendations.component.scss'
})
export class ClothingRecommendationsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly fortyGuard = inject(FortyGuardService);
  readonly form = this.fb.nonNullable.group({
    location: ['', [Validators.required, Validators.maxLength(120)]],
    latitude: [null as number | null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [null as number | null, [Validators.required, Validators.min(-180), Validators.max(180)]],
    temperatureCelsius: [null as number | null, [Validators.required]],
    startDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    startTime: [new Date().toTimeString().slice(0, 5), [Validators.required]],
    endTime: ['']
  });
  health: ApiHealth | null = null;
  recommendation: ClothingRecommendation | null = null;
  loadingHealth = true;
  submitting = false;
  locating = false;
  errorMessage = '';
  locationError = '';
  locationResults: LocationResult[] = [];
  searchingLocations = false;

  ngOnInit(): void {
    this.fortyGuard.getHealth().subscribe({
      next: (health) => { this.health = health; this.loadingHealth = false; },
      error: () => { this.loadingHealth = false; }
    });
    this.form.controls.location.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      filter((query) => query.trim().length >= 2)
    ).subscribe((query) => this.searchLocations(query));
  }

  searchLocations(query: string): void {
    this.searchingLocations = true;
    this.locationResults = [];
    this.locationError = '';
    this.fortyGuard.searchLocations(query).subscribe({
      next: ({ locations }) => {
        this.locationResults = locations;
        this.searchingLocations = false;
      },
      error: () => {
        this.locationError = 'Destination search is unavailable. Enter coordinates manually.';
        this.searchingLocations = false;
      }
    });
  }

  selectLocation(result: LocationResult): void {
    this.form.patchValue({
      location: result.name,
      latitude: result.latitude,
      longitude: result.longitude
    });
    this.locationResults = [];
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationError = 'This browser does not support location access.';
      return;
    }
    this.locating = true;
    this.locationError = '';
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.form.patchValue({
          latitude: coords.latitude,
          longitude: coords.longitude,
          location: 'Current location'
        });
        this.locating = false;
      },
      () => {
        this.locationError = 'Location access was unavailable. Enter coordinates manually.';
        this.locating = false;
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.errorMessage = '';
    this.recommendation = null;
    const form = this.form.getRawValue();
    this.fortyGuard.getClothingRecommendation({
      location: form.location.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      temperatureCelsius: Number(form.temperatureCelsius),
      startDate: form.startDate,
      startTime: form.startTime,
      ...(form.endTime ? { endTime: form.endTime } : {})
    }).subscribe({
      next: (result) => { this.recommendation = result; this.submitting = false; },
      error: (error: unknown) => {
        this.errorMessage = error instanceof HttpErrorResponse
          ? error.error?.error || 'The backend could not complete this request.'
          : 'The backend could not complete this request.';
        this.submitting = false;
      }
    });
  }
}
