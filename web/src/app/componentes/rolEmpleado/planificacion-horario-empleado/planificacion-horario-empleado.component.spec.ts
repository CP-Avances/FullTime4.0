import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionHorarioEmpleadoComponent } from './planificacion-horario-empleado.component';

describe('PlanificacionHorarioEmpleadoComponent', () => {
  let component: PlanificacionHorarioEmpleadoComponent;
  let fixture: ComponentFixture<PlanificacionHorarioEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanificacionHorarioEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanificacionHorarioEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
