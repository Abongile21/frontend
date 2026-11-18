export interface ClothingRequest {
  location: string;
  latitude: number;
  longitude: number;
  temperatureCelsius: number;
  startDate: string;
  startTime: string;
  endTime?: string;
}

export interface EnvironmentalObservation {
  temperatureCelsius: number | null;
  feelsLikeCelsius: number | null;
  humidityPercent: number | null;
  windKph: number | null;
  precipitationMm: number | null;
  solarIrradianceWm2: number | null;
  forecastTemperaturesCelsius: number[];
}

export interface ClothingRecommendation {
  location: string;
  observation: EnvironmentalObservation;
  clothing: string[];
  footwear: string[];
  advice: string[];
  explanations: string[];
  dataSource: 'FortyGuard';
}

export interface ApiHealth {
  status: 'ok';
  fortyGuard: 'configured' | 'disabled';
}

export interface LocationResult {
  name: string;
  secondary: string;
  displayName: string;
  latitude: number;
  longitude: number;
}
