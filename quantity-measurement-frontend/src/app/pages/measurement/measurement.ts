import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

type MeasurementType = 'Length' | 'Weight' | 'Temperature' | 'Volume';
type ActionType = 'Comparison' | 'Conversion' | 'Arithmetic';

@Component({
  selector: 'app-measurement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurement.html',
  styleUrl: './measurement.css'
})
export class Measurement {

  // ── State ──────────────────────────────────────
  chosenType: MeasurementType = 'Length';
  chosenAction: ActionType = 'Comparison';

  measurementTypes: MeasurementType[] = ['Length', 'Weight', 'Temperature', 'Volume'];
  actionTypes: ActionType[]           = ['Comparison', 'Conversion', 'Arithmetic'];
  operators: string[]                 = ['+', '-', '×', '÷'];
  chosenOperator                      = '+';

  // ── Units map ──────────────────────────────────
  units: Record<MeasurementType, string[]> = {
    Length:      ['Kilometer', 'Meter', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch'],
    Weight:      ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Ton'],
    Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
    Volume:      ['Litre', 'Millilitre', 'Cubic Meter', 'Gallon', 'Cup']
  };

  typeIcons: Record<MeasurementType, string> = {
    Length: '📏', Weight: '⚖️', Temperature: '🌡️', Volume: '🧪'
  };

  // ── Comparison / Conversion ────────────────────
  fromValue  = 1;
  fromUnit   = 'Kilometer';
  toValue: number | string = 1000;
  toUnit     = 'Meter';

  // ── Arithmetic ─────────────────────────────────
  value1     = 1;
  unit1      = 'Kilometer';
  value2     = 1;
  unit2      = 'Meter';
  resultUnit = 'Kilometer';
  result: number | string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  get currentUnits(): string[] {
    return this.units[this.chosenType];
  }

  pickType(type: MeasurementType): void {
    this.chosenType  = type;
    this.fromUnit    = this.currentUnits[0];
    this.toUnit      = this.currentUnits[1];
    this.unit1       = this.currentUnits[0];
    this.unit2       = this.currentUnits[1];
    this.resultUnit  = this.currentUnits[0];
    this.result      = null;
    this.toValue     = '';
  }

  pickAction(action: ActionType): void {
    this.chosenAction = action;
    this.result       = null;
  }

  calculate(): void {
    if (this.chosenAction === 'Comparison') {
      const a = Number(this.fromValue);
      const b = Number(this.toValue);
      this.result = a > b ? `${a} ${this.fromUnit} is GREATER`
                  : a < b ? `${b} ${this.toUnit} is GREATER`
                  : 'Both values are EQUAL';

    } else if (this.chosenAction === 'Conversion') {
      this.toValue = (this.fromValue * 1000).toFixed(3);

    } else {
      const v1 = Number(this.value1);
      const v2 = Number(this.value2) * 0.001;
      switch (this.chosenOperator) {
        case '+': this.result = +(v1 + v2).toFixed(4); break;
        case '-': this.result = +(v1 - v2).toFixed(4); break;
        case '×': this.result = +(v1 * v2).toFixed(4); break;
        case '÷': this.result = v2 !== 0
                    ? +(v1 / v2).toFixed(4)
                    : 'Cannot divide by zero'; break;
      }
    }
  }

  logout():      void { this.authService.logout(); }
  goToHistory(): void { this.router.navigate(['/history']); }
  goToDashboard(): void { this.router.navigate(['/dashboard']); }
}