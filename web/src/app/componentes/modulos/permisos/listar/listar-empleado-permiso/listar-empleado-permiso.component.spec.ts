import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarEmpleadoPermisoComponent } from './listar-empleado-permiso.component';

describe('ListarEmpleadoPermisoComponent', () => {
  let component: ListarEmpleadoPermisoComponent;
  let fixture: ComponentFixture<ListarEmpleadoPermisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarEmpleadoPermisoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarEmpleadoPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
