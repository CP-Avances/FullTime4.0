import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEmpleadosInactivosDetalleComponent } from './ver-empleados-inactivos-detalle.component';

describe('VerEmpleadosInactivosDetalleComponent', () => {
  let component: VerEmpleadosInactivosDetalleComponent;
  let fixture: ComponentFixture<VerEmpleadosInactivosDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerEmpleadosInactivosDetalleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerEmpleadosInactivosDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
