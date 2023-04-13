import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratoCargoEmpleadoComponent } from './contrato-cargo-empleado.component';

describe('ContratoCargoEmpleadoComponent', () => {
  let component: ContratoCargoEmpleadoComponent;
  let fixture: ComponentFixture<ContratoCargoEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContratoCargoEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratoCargoEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
