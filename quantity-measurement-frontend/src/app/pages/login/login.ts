import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
 
  activeTab: 'login' | 'register' = 'login';
 
  // Login
  loginEmail    = '';
  loginPassword = '';
  loginError    = '';
 
  // Register — fullName is split inside AuthService.signup()
  registerFullName        = '';
  registerEmail           = '';
  registerPassword        = '';
  registerConfirmPassword = '';
  registerError           = '';
  registerSuccess         = '';
 
  isLoading = false;
 
  private returnUrl = '/measurement';
 
  constructor(
    private auth:  AuthService,
    private router: Router,
    private route:  ActivatedRoute
  ) {}
 
  ngOnInit(): void {
    // Where to go after successful auth (set by authGuard)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/measurement';
 
    // ── OAuth2 callback: /oauth2/redirect?token=JWT lands here ───────────
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.auth.handleOAuth2Redirect(token);
      return; // navigates away immediately
    }
 
    // Already logged in → go straight to destination
    if (this.auth.hasToken()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }
 
  // ── Google ────────────────────────────────────────────────────────────────
  onGoogle(): void {
    this.auth.loginWithGoogle();
  }
 
  // ── Login ─────────────────────────────────────────────────────────────────
  onLogin(): void {
    this.loginError = '';
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Please fill in all fields.';
      return;
    }
    this.isLoading = true;
 
    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading  = false;
        this.loginError = this.extractError(err, 'Invalid email or password.');
      }
    });
  }
 
  // ── Register ──────────────────────────────────────────────────────────────
  onRegister(): void {
    this.registerError = '';
    if (!this.registerFullName || !this.registerEmail || !this.registerPassword) {
      this.registerError = 'Please fill in all fields.';
      return;
    }
    if (this.registerPassword !== this.registerConfirmPassword) {
      this.registerError = 'Passwords do not match.';
      return;
    }
    this.isLoading = true;
 
    this.auth.signup(this.registerFullName, this.registerEmail, this.registerPassword).subscribe({
      next: () => {
        this.isLoading       = false;
        this.registerSuccess = 'Account created! Please sign in.';
        setTimeout(() => {
          this.activeTab       = 'login';
          this.registerSuccess = '';
        }, 1500);
      },
      error: (err) => {
        this.isLoading     = false;
        this.registerError = this.extractError(err, 'Registration failed. Please try again.');
      }
    });
  }
 
  // Surfaces real backend error messages instead of hiding them
  private extractError(err: any, fallback: string): string {
    if (err?.status === 0)   return 'Cannot reach server. Is the backend running on port 8080?';
    if (err?.status === 409) return 'An account with this email already exists.';
    if (err?.status === 400) {
      // Spring validation returns errors as a map — show the first one
      const errors = err?.error?.errors;
      if (errors) return Object.values(errors).join(', ');
    }
    return err?.error?.message || err?.error?.error || fallback;
  }
}
 


























