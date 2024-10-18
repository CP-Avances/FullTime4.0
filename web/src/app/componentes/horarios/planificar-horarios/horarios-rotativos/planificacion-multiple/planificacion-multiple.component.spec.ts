import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionMultipleComponent } from './planificacion-multiple.component';

describe('PlanificacionMultipleComponent', () => {
  let component: PlanificacionMultipleComponent;
  let fixture: ComponentFixture<PlanificacionMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanificacionMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanificacionMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
