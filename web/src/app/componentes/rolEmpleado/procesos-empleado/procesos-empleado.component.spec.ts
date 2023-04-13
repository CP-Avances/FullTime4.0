import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesosEmpleadoComponent } from './procesos-empleado.component';

describe('ProcesosEmpleadoComponent', () => {
  let component: ProcesosEmpleadoComponent;
  let fixture: ComponentFixture<ProcesosEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcesosEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcesosEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
