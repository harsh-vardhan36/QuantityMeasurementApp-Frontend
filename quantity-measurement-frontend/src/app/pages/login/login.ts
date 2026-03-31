import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

  // Login fields
  loginEmail = '';
  loginPassword = '';
  loginError = '';

  // Register fields
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  registerError = '';
  registerSuccess = '';

  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Handle OAuth2 callback — token comes as ?token=...
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.handleOAuth2Callback(token);
      }
    });

    // Already logged in → go to measurement
    if (this.authService.hasToken()) {
      this.router.navigate(['/measurement']);
    }
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Please fill in all fields.';
      return;
    }
    this.isLoading = true;
    this.loginError = '';

    // Dummy login for now
    setTimeout(() => {
      if (this.loginEmail === 'test@test.com' && this.loginPassword === 'password') {
        this.authService.saveToken('dummy-jwt-token-for-testing');
        this.router.navigate(['/measurement']);
      } else {
        this.loginError = 'Invalid email or password.';
      }
      this.isLoading = false;
    }, 800);
  }

  onRegister(): void {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.registerError = 'Please fill in all fields.';
      return;
    }
    if (this.registerPassword !== this.registerConfirmPassword) {
      this.registerError = 'Passwords do not match.';
      return;
    }
    this.isLoading = true;
    this.registerError = '';

    // Dummy register for now
    setTimeout(() => {
      this.registerSuccess = 'Account created! Please login.';
      this.isLoading = false;
      setTimeout(() => this.activeTab = 'login', 1500);
    }, 800);
  }
}