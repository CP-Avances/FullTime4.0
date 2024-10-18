import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioMultipleEmpleadoComponent } from './horario-multiple-empleado.component';

describe('HorarioMultipleEmpleadoComponent', () => {
  let component: HorarioMultipleEmpleadoComponent;
  let fixture: ComponentFixture<HorarioMultipleEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorarioMultipleEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorarioMultipleEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
