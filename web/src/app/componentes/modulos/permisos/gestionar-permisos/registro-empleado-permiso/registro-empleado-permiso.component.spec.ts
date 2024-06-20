import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEmpleadoPermisoComponent } from './registro-empleado-permiso.component';

describe('RegistroEmpleadoPermisoComponent', () => {
  let component: RegistroEmpleadoPermisoComponent;
  let fixture: ComponentFixture<RegistroEmpleadoPermisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroEmpleadoPermisoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroEmpleadoPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
