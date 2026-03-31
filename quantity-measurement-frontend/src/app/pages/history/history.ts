import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

interface HistoryItem {
  id: number;
  type: string;
  action: string;
  description: string;
  result: string;
  date: string;
  icon: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {

  searchQuery = '';
  filterType  = 'All';
  filterAction = 'All';

  measurementTypes = ['All', 'Length', 'Weight', 'Temperature', 'Volume'];
  actionTypes      = ['All', 'Comparison', 'Conversion', 'Arithmetic'];

  // Dummy history data
  allHistory: HistoryItem[] = [
    { id: 1,  type: 'Length',      action: 'Conversion',  description: '5 Kilometer → Meter',          result: '5000 Meter',       date: '2026-03-31 11:30', icon: '📏' },
    { id: 2,  type: 'Weight',      action: 'Comparison',  description: '100 Gram vs 0.1 Kilogram',     result: 'EQUAL',            date: '2026-03-31 11:15', icon: '⚖️' },
    { id: 3,  type: 'Volume',      action: 'Arithmetic',  description: '3 Litre + 500 Millilitre',     result: '3.5 Litre',        date: '2026-03-31 10:50', icon: '🧪' },
    { id: 4,  type: 'Temperature', action: 'Conversion',  description: '100 Celsius → Fahrenheit',     result: '212 Fahrenheit',   date: '2026-03-31 10:20', icon: '🌡️' },
    { id: 5,  type: 'Length',      action: 'Comparison',  description: '1 Mile vs 1 Kilometer',        result: 'Mile is GREATER',  date: '2026-03-30 17:45', icon: '📏' },
    { id: 6,  type: 'Weight',      action: 'Arithmetic',  description: '2 Kilogram - 500 Gram',        result: '1.5 Kilogram',     date: '2026-03-30 16:30', icon: '⚖️' },
    { id: 7,  type: 'Length',      action: 'Conversion',  description: '100 Meter → Centimeter',       result: '10000 Centimeter', date: '2026-03-30 15:10', icon: '📏' },
    { id: 8,  type: 'Volume',      action: 'Comparison',  description: '1 Litre vs 1000 Millilitre',   result: 'EQUAL',            date: '2026-03-30 14:00', icon: '🧪' },
    { id: 9,  type: 'Temperature', action: 'Arithmetic',  description: '20 Celsius + 10 Celsius',      result: '30 Celsius',       date: '2026-03-29 12:00', icon: '🌡️' },
    { id: 10, type: 'Weight',      action: 'Conversion',  description: '1 Kilogram → Gram',            result: '1000 Gram',        date: '2026-03-29 10:30', icon: '⚖️' },
  ];

  get filteredHistory(): HistoryItem[] {
    return this.allHistory.filter(item => {
      const matchesType   = this.filterType   === 'All' || item.type   === this.filterType;
      const matchesAction = this.filterAction === 'All' || item.action === this.filterAction;
      const matchesSearch = this.searchQuery === '' ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.result.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesType && matchesAction && matchesSearch;
    });
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'Conversion':  return 'badge-blue';
      case 'Comparison':  return 'badge-green';
      case 'Arithmetic':  return 'badge-orange';
      default:            return 'badge-blue';
    }
  }

  clearFilters(): void {
    this.searchQuery  = '';
    this.filterType   = 'All';
    this.filterAction = 'All';
  }

  constructor(private authService: AuthService, private router: Router) {}

  goToMeasurement(): void { this.router.navigate(['/measurement']); }
  goToDashboard():   void { this.router.navigate(['/dashboard']); }
  logout():          void { this.authService.logout(); }
}