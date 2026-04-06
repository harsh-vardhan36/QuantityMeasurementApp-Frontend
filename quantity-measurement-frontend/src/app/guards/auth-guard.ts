import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';
 
export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
 
  if (auth.hasToken()) return true;
 
  // Save where the user was trying to go so we can redirect back after login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
 


























