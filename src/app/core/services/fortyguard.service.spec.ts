import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FortyGuardService } from './fortyguard.service';

describe('FortyGuardService', () => {
  let service: FortyGuardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(FortyGuardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads the backend health status', () => {
    service.getHealth().subscribe((health) => expect(health.fortyGuard).toBe('disabled'));
    http.expectOne('http://localhost:3000/api/health').flush({ status: 'ok', fortyGuard: 'disabled' });
  });

  it('posts the selected location to the backend without calling FortyGuard from the browser', () => {
    const request = {
      location: 'Cape Town',
      latitude: -33.9,
      longitude: 18.4,
      temperatureCelsius: 21,
      startDate: '2026-11-17',
      startTime: '12:00'
    };
    service.getClothingRecommendation(request).subscribe();
    const testRequest = http.expectOne('http://localhost:3000/api/clothing/recommendations');
    expect(testRequest.request.method).toBe('POST');
    expect(testRequest.request.body).toEqual(request);
    testRequest.flush({
      location: 'Cape Town',
      observation: {
        temperatureCelsius: 21,
        feelsLikeCelsius: null,
        humidityPercent: null,
        windKph: null,
        precipitationMm: null,
        solarIrradianceWm2: null,
        forecastTemperaturesCelsius: []
      },
      clothing: [],
      footwear: [],
      advice: [],
      explanations: [],
      dataSource: 'FortyGuard'
    });
  });

  it('searches destinations through the backend', () => {
    service.searchLocations('Austin, Texas').subscribe((body) => {
      expect(body.locations.length).toBe(1);
    });
    const testRequest = http.expectOne((request) =>
      request.url === 'http://localhost:3000/api/location/search' &&
      request.params.get('q') === 'Austin, Texas'
    );
    testRequest.flush({
      locations: [{
        name: 'Austin',
        secondary: 'Texas, United States',
        displayName: 'Austin, Texas, United States',
        latitude: 30.2672,
        longitude: -97.7431
      }]
    });
  });
});
