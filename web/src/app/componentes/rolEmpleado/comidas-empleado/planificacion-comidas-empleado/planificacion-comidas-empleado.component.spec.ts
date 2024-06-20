import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionComidasEmpleadoComponent } from './planificacion-comidas-empleado.component';

describe('PlanificacionComidasEmpleadoComponent', () => {
  let component: PlanificacionComidasEmpleadoComponent;
  let fixture: ComponentFixture<PlanificacionComidasEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanificacionComidasEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanificacionComidasEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
