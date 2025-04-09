import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreAbiertosComponent } from './timbre-abiertos.component';

describe('TimbreAbiertosComponent', () => {
  let component: TimbreAbiertosComponent;
  let fixture: ComponentFixture<TimbreAbiertosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimbreAbiertosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimbreAbiertosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
