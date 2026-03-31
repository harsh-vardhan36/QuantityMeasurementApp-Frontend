import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Measurement } from './measurement';

describe('Measurement', () => {
  let component: Measurement;
  let fixture: ComponentFixture<Measurement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Measurement],
    }).compileComponents();

    fixture = TestBed.createComponent(Measurement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
