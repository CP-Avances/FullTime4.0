import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasPlanificadasEmpleadoComponent } from './horas-planificadas-empleado.component';

describe('HorasPlanificadasEmpleadoComponent', () => {
  let component: HorasPlanificadasEmpleadoComponent;
  let fixture: ComponentFixture<HorasPlanificadasEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorasPlanificadasEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasPlanificadasEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
