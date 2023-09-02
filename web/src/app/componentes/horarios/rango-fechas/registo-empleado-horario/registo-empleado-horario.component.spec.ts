import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistoEmpleadoHorarioComponent } from './registo-empleado-horario.component';

describe('RegistoEmpleadoHorarioComponent', () => {
  let component: RegistoEmpleadoHorarioComponent;
  let fixture: ComponentFixture<RegistoEmpleadoHorarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistoEmpleadoHorarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistoEmpleadoHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
