import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEmpleadoProcesoComponent } from './editar-empleado-proceso.component';

describe('EditarEmpleadoProcesoComponent', () => {
  let component: EditarEmpleadoProcesoComponent;
  let fixture: ComponentFixture<EditarEmpleadoProcesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarEmpleadoProcesoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEmpleadoProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
