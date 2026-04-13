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
 
  // Register
  registerFullName        = '';
  registerEmail           = '';
  registerPassword        = '';
  registerConfirmPassword = '';
  registerError           = '';
  registerSuccess         = '';
 
  isLoading = false;
 
  // ── Show/Hide password toggles ────────────────────────────────────────────
  showLoginPassword           = false;
  showRegisterPassword        = false;
  showRegisterConfirmPassword = false;
 
  private returnUrl = '/measurement';
 
  constructor(
    private auth:   AuthService,
    private router: Router,
    private route:  ActivatedRoute
  ) {}
 
  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/measurement';
 
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.auth.handleOAuth2Redirect(token);
      return;
    }
 
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
 
    // ── Smart name splitting ───────────────────────────────────────────────
    // "Harsh"               → firstName: "Harsh",        lastName: ""
    // "Harsh Vardhan"       → firstName: "Harsh",        lastName: "Vardhan"
    // "Harsh Vardhan Singh" → firstName: "Harsh Vardhan" lastName: "Singh"
    // Middle name is merged into firstName since backend has firstName + lastName only
    const parts     = this.registerFullName.trim().split(/\s+/);
    const firstName = parts.length >= 2
      ? parts.slice(0, parts.length - 1).join(' ')
      : parts[0];
    const lastName  = parts.length >= 2
      ? parts[parts.length - 1]
      : '';
 
    this.auth.signup(firstName, lastName, this.registerEmail, this.registerPassword).subscribe({
      next: () => {
        this.isLoading       = false;
        this.registerSuccess = 'Account created! Please sign in.';
      
        // clear fields (important UX fix)
        this.registerFullName = '';
        this.registerEmail = '';
        this.registerPassword = '';
        this.registerConfirmPassword = '';
      
        setTimeout(() => {
          this.activeTab       = 'login';
          this.registerSuccess = '';
        }, 1500);
      }
  });
  }
 
  // ── Toggle helpers ────────────────────────────────────────────────────────
  toggleLoginPassword():           void { this.showLoginPassword           = !this.showLoginPassword; }
  toggleRegisterPassword():        void { this.showRegisterPassword        = !this.showRegisterPassword; }
  toggleRegisterConfirmPassword(): void { this.showRegisterConfirmPassword = !this.showRegisterConfirmPassword; }
 
  // ── Error extractor ───────────────────────────────────────────────────────
  private extractError(err: any, fallback: string): string {
    if (err?.status === 0)   return 'Cannot reach server. Is the backend running on port 8080?';
    if (err?.status === 409) return 'An account with this email already exists.';
    if (err?.status === 400) {
      const errors = err?.error?.errors;
      if (errors) return Object.values(errors).join(', ');
    }
    return err?.error?.message || err?.error?.error || fallback;
  }
}
 

