import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  user = {
    name: 'Harsh Vardhan',
    email: 'harsh15vardhan456@gmail.com',
    provider: 'GOOGLE',
    joinedDate: 'March 2026',
    avatar: ''
  };

  // Dummy stats
  stats = [
    { label: 'Total Calculations', value: 42, icon: '🔢' },
    { label: 'Comparisons',        value: 15, icon: '⚖️' },
    { label: 'Conversions',        value: 18, icon: '🔄' },
    { label: 'Arithmetic Ops',     value: 9,  icon: '➕' }
  ];

  // Dummy recent activity
  recentActivity = [
    { type: 'Conversion',  description: '5 Kilometer → 5000 Meter',     time: '2 mins ago',  icon: '🔄' },
    { type: 'Comparison',  description: '100g vs 0.1kg → EQUAL',        time: '15 mins ago', icon: '⚖️' },
    { type: 'Arithmetic',  description: '3 Litre + 500ml = 3.5 Litre',  time: '1 hour ago',  icon: '➕' },
    { type: 'Conversion',  description: '100°C → 212°F',                time: '2 hours ago', icon: '🌡️' },
    { type: 'Comparison',  description: '1 Mile vs 1 Kilometer → Mile GREATER', time: 'Yesterday', icon: '📏' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const info = this.authService.getUserInfo();
    if (info) {
      this.user.email = info.sub || info.email || this.user.email;
    }
  }

  goToMeasurement(): void { this.router.navigate(['/measurement']); }
  goToHistory():     void { this.router.navigate(['/history']); }
  logout():          void { this.authService.logout(); }

  getInitials(): string {
    return this.user.name.split(' ')
      .map(n => n[0]).join('').toUpperCase();
  }
}