import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPermisoEmpleadoComponent } from './editar-permiso-empleado.component';

describe('EditarPermisoEmpleadoComponent', () => {
  let component: EditarPermisoEmpleadoComponent;
  let fixture: ComponentFixture<EditarPermisoEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarPermisoEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarPermisoEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
