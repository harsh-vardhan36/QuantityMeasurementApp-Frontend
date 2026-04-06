import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
 
// Automatically attaches the JWT as a Bearer token to every outgoing HTTP request.
// Skips requests that already have an Authorization header (e.g. the logout call
// which sets its own header manually).
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();
 
  if (token && !req.headers.has('Authorization')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
 
  return next(req);
};
 



























