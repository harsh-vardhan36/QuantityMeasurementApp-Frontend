import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
 
export const routes: Routes = [
 
  // Default → measurement (public, no login needed)
  { path: '', redirectTo: 'measurement', pathMatch: 'full' },
 
  // Auth page — handles login, register AND the OAuth2 redirect callback
  { path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
 
  // OAuth2 callback — MUST match app.oauth2.redirectUri in application.properties
  // Backend sends: http://localhost:4200/oauth2/redirect?token=JWT
  { path: 'oauth2/redirect',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
 
  // Public — guests can use measurement without logging in
  { path: 'measurement',
    loadComponent: () => import('./pages/measurement/measurement').then(m => m.Measurement)
  },
 
  // Protected — requires JWT
  { path: 'history',
    loadComponent: () => import('./pages/history/history').then(m => m.History),
    canActivate: [authGuard]
  },
  { path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
 
  { path: '**', redirectTo: 'measurement' }
];
 


























