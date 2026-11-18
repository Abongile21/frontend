import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClothingRecommendationsComponent } from './features/clothing-recommendations/clothing-recommendations.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, title: 'Dashboard · FortyGuard Explorer' },
  { path: 'recommendations', component: ClothingRecommendationsComponent, title: 'What Should I Wear? · FortyGuard Explorer' },
  { path: '**', redirectTo: '' }
];
