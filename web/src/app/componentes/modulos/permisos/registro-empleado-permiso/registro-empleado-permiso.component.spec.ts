import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEmpleadoPermisoComponent } from './registro-empleado-permiso.component';

describe('RegistroEmpleadoPermisoComponent', () => {
  let component: RegistroEmpleadoPermisoComponent;
  let fixture: ComponentFixture<RegistroEmpleadoPermisoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroEmpleadoPermisoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroEmpleadoPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
