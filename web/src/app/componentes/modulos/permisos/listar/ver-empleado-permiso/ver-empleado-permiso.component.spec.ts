import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEmpleadoPermisoComponent } from './ver-empleado-permiso.component';

describe('VerEmpleadoPermisoComponent', () => {
  let component: VerEmpleadoPermisoComponent;
  let fixture: ComponentFixture<VerEmpleadoPermisoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerEmpleadoPermisoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerEmpleadoPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
