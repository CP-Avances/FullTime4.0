import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioMultipleEmpleadoComponent } from './horario-multiple-empleado.component';

describe('HorarioMultipleEmpleadoComponent', () => {
  let component: HorarioMultipleEmpleadoComponent;
  let fixture: ComponentFixture<HorarioMultipleEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorarioMultipleEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorarioMultipleEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
