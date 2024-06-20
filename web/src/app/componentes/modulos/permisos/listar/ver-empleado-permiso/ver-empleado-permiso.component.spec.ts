import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEmpleadoPermisoComponent } from './ver-empleado-permiso.component';

describe('VerEmpleadoPermisoComponent', () => {
  let component: VerEmpleadoPermisoComponent;
  let fixture: ComponentFixture<VerEmpleadoPermisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerEmpleadoPermisoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerEmpleadoPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
