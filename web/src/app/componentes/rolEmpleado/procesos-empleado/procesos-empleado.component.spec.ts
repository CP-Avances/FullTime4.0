import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesosEmpleadoComponent } from './procesos-empleado.component';

describe('ProcesosEmpleadoComponent', () => {
  let component: ProcesosEmpleadoComponent;
  let fixture: ComponentFixture<ProcesosEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcesosEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcesosEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
