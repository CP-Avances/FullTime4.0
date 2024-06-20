import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPermisoEmpleadoComponent } from './editar-permiso-empleado.component';

describe('EditarPermisoEmpleadoComponent', () => {
  let component: EditarPermisoEmpleadoComponent;
  let fixture: ComponentFixture<EditarPermisoEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarPermisoEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPermisoEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
