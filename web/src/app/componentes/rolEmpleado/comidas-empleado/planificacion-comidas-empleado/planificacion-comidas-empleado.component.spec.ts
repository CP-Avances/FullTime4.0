import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionComidasEmpleadoComponent } from './planificacion-comidas-empleado.component';

describe('PlanificacionComidasEmpleadoComponent', () => {
  let component: PlanificacionComidasEmpleadoComponent;
  let fixture: ComponentFixture<PlanificacionComidasEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanificacionComidasEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanificacionComidasEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
