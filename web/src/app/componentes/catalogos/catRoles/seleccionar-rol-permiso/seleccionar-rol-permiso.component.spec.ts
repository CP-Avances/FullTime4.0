import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionarRolPermisoComponent } from './seleccionar-rol-permiso.component';

describe('SeleccionarRolPermisoComponent', () => {
  let component: SeleccionarRolPermisoComponent;
  let fixture: ComponentFixture<SeleccionarRolPermisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeleccionarRolPermisoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionarRolPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
