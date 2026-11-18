import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FortyGuardService } from '../../core/services/fortyguard.service';
import { ClothingRecommendationsComponent } from './clothing-recommendations.component';

describe('ClothingRecommendationsComponent', () => {
  let fixture: ComponentFixture<ClothingRecommendationsComponent>;
  let service: jasmine.SpyObj<FortyGuardService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<FortyGuardService>('FortyGuardService', [
      'getHealth',
      'getClothingRecommendation'
    ]);
    service.getHealth.and.returnValue(of({ status: 'ok', fortyGuard: 'disabled' }));
    service.getClothingRecommendation.and.returnValue(throwError(() => new Error('not configured')));
    await TestBed.configureTestingModule({
      imports: [ClothingRecommendationsComponent],
      providers: [{ provide: FortyGuardService, useValue: service }, provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(ClothingRecommendationsComponent);
    fixture.detectChanges();
  });

  it('renders the recommendation card and never presents sample weather as live data', () => {
    expect(fixture.nativeElement.textContent).toContain('What Should I Wear?');
    expect(fixture.nativeElement.textContent).toContain('FortyGuard data only');
    expect(fixture.nativeElement.textContent).toContain('Your recommendation will appear here');
    expect(fixture.nativeElement.textContent).not.toContain('22°C');
  });

  it('uses browser geolocation to populate coordinates', () => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
      success({ coords: { latitude: -33.9, longitude: 18.4 } } as GeolocationPosition);
    });
    fixture.componentInstance.useCurrentLocation();
    expect(fixture.componentInstance.form.controls.latitude.value).toBe(-33.9);
    expect(fixture.componentInstance.form.controls.longitude.value).toBe(18.4);
  });
});
