import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
 
@Injectable({ providedIn: 'root' })
export class AuthService {
 
  private readonly API     = 'http://localhost:8080';
  private readonly TOKEN_K = 'jwt_token';
 
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
 
  constructor(private http: HttpClient, private router: Router) {}
 
  // ── Google OAuth2 ─────────────────────────────────────────────────────────
  loginWithGoogle(): void {
    // Save current page so we can return after OAuth2 dance
    sessionStorage.setItem('returnUrl', this.router.url || '/measurement');
    window.location.href = `${this.API}/oauth2/authorize/google`;
  }
 
  // Called by LoginComponent when /oauth2/redirect?token=JWT loads
  handleOAuth2Redirect(token: string): void {
    this.saveToken(token);
    this.loggedIn$.next(true);
    const returnUrl = sessionStorage.getItem('returnUrl') || '/measurement';
    sessionStorage.removeItem('returnUrl');
    this.router.navigateByUrl(returnUrl);
  }
 
  // ── Email / Password login ────────────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.API}/api/auth/login`, { email, password })
      .pipe(tap(res => {
        this.saveToken(res.accessToken);
        this.loggedIn$.next(true);
      }));
  }
 
  // ── Register ──────────────────────────────────────────────────────────────
  // Backend SignUpRequest has @NotBlank on BOTH firstName AND lastName.
  // We split the full name the user types: "Harsh Vardhan" → first=Harsh, last=Vardhan
  // If only one word typed: use it for both fields so validation passes.
  signup(fullName: string, email: string, password: string): Observable<any> {
    const parts     = fullName.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName  = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
    return this.http.post(`${this.API}/api/auth/register`,
      { firstName, lastName, email, password });
  }
 
  // ── Logout ────────────────────────────────────────────────────────────────
  // Calls backend to blacklist the JWT, then clears local state.
  logout(): void {
    const token = this.getToken();
    if (!token) { this.clearLocal(); return; }
 
    this.http.post(
      `${this.API}/api/auth/logout`, {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({ next: () => this.clearLocal(), error: () => this.clearLocal() });
  }
 
  // ── Helpers ───────────────────────────────────────────────────────────────
  saveToken(token: string): void { localStorage.setItem(this.TOKEN_K, token); }
  getToken(): string | null       { return localStorage.getItem(this.TOKEN_K); }
  hasToken(): boolean             { return !!this.getToken(); }
  isAuthenticated(): Observable<boolean> { return this.loggedIn$.asObservable(); }
 
  getUserInfo(): any {
    const t = this.getToken();
    if (!t) return null;
    try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; }
  }
 
  private clearLocal(): void {
    localStorage.removeItem(this.TOKEN_K);
    this.loggedIn$.next(false);
    this.router.navigate(['/login']);
  }
}
 