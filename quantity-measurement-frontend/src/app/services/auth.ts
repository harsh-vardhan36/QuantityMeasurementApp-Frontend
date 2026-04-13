import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = environment.apiUrl + '/api/auth';
  private apiUrl = environment.apiUrl; 
  private tokenKey = 'jwt_token';
  private isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  // ✅ FIXED GOOGLE LOGIN
  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/oauth2/authorization/google`;
  }

  handleOAuth2Redirect(token: string): void {
    this.saveToken(token);
    this.isLoggedIn$.next(true);
    this.router.navigate(['/measurement']);
  }

  handleOAuth2Callback(token: string): void {
    this.handleOAuth2Redirect(token);
  }

  // ✅ LOGIN (already correct)
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res: any) => {
        this.saveToken(res.accessToken);
        this.isLoggedIn$.next(true);
      }));
  }

  // ✅ SIGNUP (already correct)
  signup(firstName: string, lastName: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, {
      firstName,
      lastName,
      email,
      password
    });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}