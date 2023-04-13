import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleHorarioEmpleadoComponent } from './detalle-horario-empleado.component';

describe('DetalleHorarioEmpleadoComponent', () => {
  let component: DetalleHorarioEmpleadoComponent;
  let fixture: ComponentFixture<DetalleHorarioEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleHorarioEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleHorarioEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
