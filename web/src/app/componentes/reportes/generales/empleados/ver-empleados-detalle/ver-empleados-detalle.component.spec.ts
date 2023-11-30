import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEmpleadosDetalleComponent } from './ver-empleados-detalle.component';

describe('VerEmpleadosActivosDetalleComponent', () => {
  let component: VerEmpleadosDetalleComponent;
  let fixture: ComponentFixture<VerEmpleadosDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerEmpleadosDetalleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerEmpleadosDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
