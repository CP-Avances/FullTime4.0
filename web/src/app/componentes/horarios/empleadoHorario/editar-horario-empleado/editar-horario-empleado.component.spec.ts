import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarHorarioEmpleadoComponent } from './editar-horario-empleado.component';

describe('EditarHorarioEmpleadoComponent', () => {
  let component: EditarHorarioEmpleadoComponent;
  let fixture: ComponentFixture<EditarHorarioEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarHorarioEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarHorarioEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
