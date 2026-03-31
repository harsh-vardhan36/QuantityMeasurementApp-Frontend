import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',
    loadComponent: () => import('./pages/login/login')
      .then(m => m.LoginComponent)
  },
  { path: 'oauth2/callback',
    loadComponent: () => import('./pages/login/login')
      .then(m => m.LoginComponent)
  },
  { path: 'measurement',
    loadComponent: () => import('./pages/measurement/measurement')
      .then(m => m.Measurement),
    canActivate: [authGuard]
  },
  { path: 'history',
    loadComponent: () => import('./pages/history/history')
      .then(m => m.History),
    canActivate: [authGuard]
  },
  { path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];