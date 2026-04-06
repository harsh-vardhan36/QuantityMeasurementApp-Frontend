import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import {
  MeasurementService,
  QuantityDTO,
  QuantityInputDTO,
  MeasurementResult,
  UNIT_MAP,
  TYPE_LABELS
} from '../../services/measurement';
 
type MeasurementType = 'LengthUnit' | 'VolumeUnit' | 'WeightUnit' | 'TemperatureUnit';
type ActionType      = 'comparison' | 'conversion' | 'arithmetic';
type ArithmeticOp    = 'add' | 'subtract' | 'multiply' | 'divide';
 
@Component({
  selector: 'app-measurement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurement.html',
  styleUrl: './measurement.css'
})
export class Measurement implements OnInit {
 
  // ── Type selection ────────────────────────────────────────────────────────
  types: { key: MeasurementType; label: string; icon: string }[] = [
    { key: 'LengthUnit',      label: 'Length',      icon: '📏' },
    { key: 'WeightUnit',      label: 'Weight',      icon: '⚖️' },
    { key: 'TemperatureUnit', label: 'Temperature', icon: '🌡️' },
    { key: 'VolumeUnit',      label: 'Volume',      icon: '🧪' },
  ];
  selectedType: MeasurementType = 'LengthUnit';
 
  // ── Action selection ──────────────────────────────────────────────────────
  selectedAction: ActionType = 'comparison';
 
  // ── Arithmetic op ─────────────────────────────────────────────────────────
  arithmeticOp:  ArithmeticOp    = 'add';
  arithmeticOps: ArithmeticOp[]  = ['add', 'subtract', 'multiply', 'divide'];
 
  // ── Input values ──────────────────────────────────────────────────────────
  value1: number = 1;
  unit1:  string = '';
  value2: number = 1;
  unit2:  string = '';
 
  targetUnit:    string  = '';
  useTargetUnit: boolean = false;
 
  // ── Units list ────────────────────────────────────────────────────────────
  get units(): string[] { return UNIT_MAP[this.selectedType] || []; }
 
  // ── Result state ──────────────────────────────────────────────────────────
  resultText:  string  = '';   // FIX: store final display string, not raw object
  resultOp:    string  = '';
  resultError: string  = '';
  showResult:  boolean = false;
  isLoading:   boolean = false;
 
  // ── Auth ──────────────────────────────────────────────────────────────────
  isLoggedIn: boolean = false;
 
  constructor(
    private svc:    MeasurementService,
    private auth:   AuthService,
    private router: Router,
    private cdr:    ChangeDetectorRef   // FIX: force Angular to detect changes
  ) {}
 
  ngOnInit(): void {
    this.isLoggedIn = this.auth.hasToken();
    this.resetUnits();
  }
 
  selectType(type: MeasurementType): void {
    this.selectedType = type;
    this.resetUnits();
    this.clearResult();
  }
 
  selectAction(action: ActionType): void {
    this.selectedAction  = action;
    this.useTargetUnit   = false;
    this.clearResult();
  }
 
  resetUnits(): void {
    const u    = this.units;
    this.unit1 = u[0] || '';
    this.unit2 = u[1] || u[0] || '';
    this.targetUnit = u[0] || '';
  }
 
  clearResult(): void {
    this.resultText  = '';
    this.resultOp    = '';
    this.resultError = '';
    this.showResult  = false;
  }
 
  get opSymbol(): string {
    return { add: '+', subtract: '−', multiply: '×', divide: '÷' }[this.arithmeticOp];
  }
 
  private qty(value: number, unit: string): QuantityDTO {
    return { value, unit, measurementType: this.selectedType };
  }
 
  // ── Round a number to max 6 significant decimal places ───────────────────
  private round(n: number): number {
    return Math.round(n * 1_000_000) / 1_000_000;
  }
 
  // ── Build display string from response ────────────────────────────────────
  private buildResultText(res: MeasurementResult): string {
    if (res.error) return res.errorMessage || 'Operation failed.';
 
    if (this.selectedAction === 'comparison') {
      return res.resultString || '';
    }
 
    if (res.resultValue !== undefined && res.resultUnit) {
      return `${this.round(res.resultValue)} ${res.resultUnit}`;
    }
 
    return res.resultString || '';
  }
 
  // ── Calculate ─────────────────────────────────────────────────────────────
  calculate(): void {
    this.clearResult();
    this.isLoading = true;
 
    let obs$;
 
    if (this.selectedAction === 'comparison') {
      obs$ = this.svc.compare({
        thisQuantityDTO: this.qty(this.value1, this.unit1),
        thatQuantityDTO: this.qty(this.value2, this.unit2),
      });
 
    } else if (this.selectedAction === 'conversion') {
      obs$ = this.svc.convert({
        thisQuantityDTO: this.qty(this.value1, this.unit1),
        thatQuantityDTO: this.qty(0, this.unit2),
      });
 
    } else {
      const input: QuantityInputDTO = {
        thisQuantityDTO: this.qty(this.value1, this.unit1),
        thatQuantityDTO: this.qty(this.value2, this.unit2),
        ...(this.useTargetUnit ? { targetQuantityDTO: this.qty(0, this.targetUnit) } : {})
      };
      switch (this.arithmeticOp) {
        case 'add':      obs$ = this.svc.add(input);      break;
        case 'subtract': obs$ = this.svc.subtract(input); break;
        case 'multiply': obs$ = this.svc.multiply(input); break;
        case 'divide':   obs$ = this.svc.divide(input);   break;
      }
    }
 
    obs$!.subscribe({
      next: (res) => {
        this.isLoading = false;
 
        if (res.error) {
          this.resultError = res.errorMessage || 'Operation failed.';
          this.showResult  = false;
        } else {
          // FIX: set primitive strings — Angular always detects primitive changes
          this.resultText = this.buildResultText(res);
          this.resultOp   = res.operation || '';
          this.showResult = true;
          this.resultError = '';
        }
 
        // FIX: explicitly tell Angular to re-render now
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading   = false;
        this.showResult  = false;
        this.resultError =
          err?.error?.message ||
          err?.error?.error   ||
          (err?.status === 401 ? 'Please log in to use this feature.' :
           err?.status === 0   ? 'Cannot reach the server. Is Spring Boot running?' :
           'Something went wrong. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }
 
  // ── Nav ───────────────────────────────────────────────────────────────────
  goToLogin():   void { this.router.navigate(['/login']); }
  goToHistory(): void { this.router.navigate(['/history']); }
  goToProfile(): void { this.router.navigate(['/dashboard']); }
  logout():      void { this.auth.logout(); }
}
 







































