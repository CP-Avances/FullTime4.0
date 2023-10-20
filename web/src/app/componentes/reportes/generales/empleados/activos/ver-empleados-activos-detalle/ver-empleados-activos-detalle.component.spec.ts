import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEmpleadosActivosDetalleComponent } from './ver-empleados-activos-detalle.component';

describe('VerEmpleadosActivosDetalleComponent', () => {
  let component: VerEmpleadosActivosDetalleComponent;
  let fixture: ComponentFixture<VerEmpleadosActivosDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerEmpleadosActivosDetalleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerEmpleadosActivosDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
