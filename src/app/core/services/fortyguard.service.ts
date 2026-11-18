import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import {
  ApiHealth,
  ClothingRecommendation,
  ClothingRequest,
  LocationResult
} from '../models/clothing-recommendation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FortyGuardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getHealth(): Observable<ApiHealth> {
    return this.http.get<ApiHealth>(`${this.baseUrl}/health`).pipe(timeout({ first: 10000 }));
  }

  getClothingRecommendation(request: ClothingRequest): Observable<ClothingRecommendation> {
    return this.http.post<ClothingRecommendation>(`${this.baseUrl}/clothing/recommendations`, request);
  }

  searchLocations(query: string): Observable<{ locations: LocationResult[] }> {
    return this.http.get<{ locations: LocationResult[] }>(
      `${this.baseUrl}/location/search`,
      { params: { q: query } }
    ).pipe(timeout({ first: 10000 }));
  }
}
