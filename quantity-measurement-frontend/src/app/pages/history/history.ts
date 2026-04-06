import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MeasurementService, MeasurementResult } from '../../services/measurement';
import { AuthService } from '../../services/auth';
 
type FilterTab = 'all' | 'compare' | 'convert' | 'add' | 'subtract' | 'multiply' | 'divide' | 'errored';
 
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit {
 
  records: MeasurementResult[] = [];
  filtered: MeasurementResult[] = [];
  isLoading = true;
  error = '';
 
  activeTab: FilterTab = 'all';
 
  tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',       label: 'All'       },
    { key: 'compare',   label: 'Compare'   },
    { key: 'convert',   label: 'Convert'   },
    { key: 'add',       label: 'Add'       },
    { key: 'subtract',  label: 'Subtract'  },
    { key: 'multiply',  label: 'Multiply'  },
    { key: 'divide',    label: 'Divide'    },
    { key: 'errored',   label: 'Errors'    },
  ];
 
  // Search
  searchTerm = '';
 
  constructor(
    private svc:    MeasurementService,
    private auth:   AuthService,
    private router: Router,
    private cdr:    ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.loadAll();
  }
 
  loadAll(): void {
    this.isLoading = true;
    this.error = '';
 
    // Load all operations in parallel then merge
    const ops = ['COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];
    let completed = 0;
    const all: MeasurementResult[] = [];
 
    ops.forEach(op => {
      this.svc.getHistory(op).subscribe({
        next: (res) => {
          all.push(...res);
          completed++;
          if (completed === ops.length) {
            // Sort newest first (by operation order — no timestamp in DTO, so reverse insertion)
            this.records  = all.reverse();
            this.applyFilter();
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          completed++;
          if (completed === ops.length) {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        }
      });
    });
  }
 
  selectTab(tab: FilterTab): void {
    this.activeTab = tab;
    this.applyFilter();
  }
 
  applyFilter(): void {
    let data = [...this.records];
 
    if (this.activeTab === 'errored') {
      data = data.filter(r => r.error);
    } else if (this.activeTab !== 'all') {
      data = data.filter(r =>
        r.operation?.toLowerCase() === this.activeTab.toUpperCase()
      );
    }
 
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(r =>
        r.thisUnit?.toLowerCase().includes(term) ||
        r.thatUnit?.toLowerCase().includes(term) ||
        r.resultUnit?.toLowerCase().includes(term) ||
        r.operation?.toLowerCase().includes(term) ||
        r.resultString?.toLowerCase().includes(term)
      );
    }
 
    this.filtered = data;
  }
 
  onSearch(): void {
    this.applyFilter();
  }
 
  formatResult(r: MeasurementResult): string {
    if (r.error) return r.errorMessage || 'Error';
    if (r.operation === 'COMPARE') return r.resultString || '';
    if (r.resultValue !== undefined && r.resultUnit) {
      return `${Math.round(r.resultValue * 1_000_000) / 1_000_000} ${r.resultUnit}`;
    }
    return r.resultString || '';
  }
 
  formatInput(r: MeasurementResult): string {
    const a = `${r.thisValue} ${r.thisUnit}`;
    if (r.operation === 'CONVERT') return `${a} → ${r.thatUnit || '?'}`;
    if (r.thatUnit && r.thatUnit !== 'N/A' && r.thatUnit !== 'FACTOR') {
      return `${a}  &  ${r.thatValue} ${r.thatUnit}`;
    }
    if (r.thatUnit === 'FACTOR') return `${a}  ×  ${r.thatValue}`;
    return a;
  }
 
  opColor(op: string | undefined): string {
    const map: Record<string, string> = {
      COMPARE:  '#7c6bda',
      CONVERT:  '#1a9e75',
      ADD:      '#2d8fd5',
      SUBTRACT: '#e07c28',
      MULTIPLY: '#c0392b',
      DIVIDE:   '#8e44ad',
    };
    return map[op || ''] || '#888';
  }
 
  goToMeasurement(): void { this.router.navigate(['/measurement']); }
  logout():           void { this.auth.logout(); }
}
 







































