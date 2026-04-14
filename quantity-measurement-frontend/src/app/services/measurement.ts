import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../environments/environment';
// Mirrors QuantityDTO.java exactly
export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: 'LengthUnit' | 'VolumeUnit' | 'WeightUnit' | 'TemperatureUnit';
}
 
// Mirrors QuantityInputDTO.java exactly
export interface QuantityInputDTO {
  thisQuantityDTO: QuantityDTO;
  thatQuantityDTO: QuantityDTO;
  targetQuantityDTO?: QuantityDTO;
}
 
// Mirrors QuantityMeasurementDTO.java exactly — all real field names
export interface MeasurementResult {
  thisValue?:             number;
  thisUnit?:             string;
  thisMeasurementType?:  string;
  thatValue?:             number;
  thatUnit?:             string;
  thatMeasurementType?:  string;
  operation?:            string;
  resultString?:         string;
  resultValue?:          number;
  resultUnit?:           string;
  resultMeasurementType?: string;
  error?:                boolean;
  errorMessage?:         string;
}
 
// Units per measurement type
export const UNIT_MAP: Record<string, string[]> = {
  LengthUnit:      ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  VolumeUnit:      ['LITER', 'MILLILITER', 'GALLON'],
  WeightUnit:      ['MILLIGRAM', 'GRAM', 'KILOGRAM', 'POUND', 'TONNE'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
};
 
export const TYPE_LABELS: Record<string, string> = {
  LengthUnit:      'Length',
  VolumeUnit:      'Volume',
  WeightUnit:      'Weight',
  TemperatureUnit: 'Temperature',
};
 
@Injectable({ providedIn: 'root' })
export class MeasurementService {
 
  private readonly BASE = '{environment.apiUrl}/api/user/quantities';
 
  constructor(private http: HttpClient) {}
 
  compare(input: QuantityInputDTO): Observable<MeasurementResult> {
    return this.http.post<MeasurementResult>(`${this.BASE}/compare`, input);
  }
 
  convert(input: QuantityInputDTO): Observable<MeasurementResult> {
    return this.http.post<MeasurementResult>(`${this.BASE}/convert`, input);
  }
 
  add(input: QuantityInputDTO): Observable<MeasurementResult> {
    return input.targetQuantityDTO
      ? this.http.post<MeasurementResult>(`${this.BASE}/add-with-target-unit`, input)
      : this.http.post<MeasurementResult>(`${this.BASE}/add`, input);
  }
 
  subtract(input: QuantityInputDTO): Observable<MeasurementResult> {
    return input.targetQuantityDTO
      ? this.http.post<MeasurementResult>(`${this.BASE}/subtract-with-target-unit`, input)
      : this.http.post<MeasurementResult>(`${this.BASE}/subtract`, input);
  }
 
  multiply(input: QuantityInputDTO): Observable<MeasurementResult> {
    return this.http.post<MeasurementResult>(`${this.BASE}/multiply`, input);
  }
 
  divide(input: QuantityInputDTO): Observable<MeasurementResult> {
    return this.http.post<MeasurementResult>(`${this.BASE}/divide`, input);
  }
 
  getHistory(operation: string): Observable<MeasurementResult[]> {
    return this.http.get<MeasurementResult[]>(`${this.BASE}/history/operation/${operation}`);
  }
 
  getHistoryByType(type: string): Observable<MeasurementResult[]> {
    return this.http.get<MeasurementResult[]>(`${this.BASE}/history/type/${type}`);
  }
 
  getErrorHistory(): Observable<MeasurementResult[]> {
    return this.http.get<MeasurementResult[]>(`${this.BASE}/history/errored`);
  }
 
  getCount(operation: string): Observable<any> {
    return this.http.get<any>(`${this.BASE}/count/${operation}`);
  }
}
 





































