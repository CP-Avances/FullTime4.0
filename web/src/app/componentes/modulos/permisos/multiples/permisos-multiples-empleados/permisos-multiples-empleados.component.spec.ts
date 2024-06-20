import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosMultiplesEmpleadosComponent } from './permisos-multiples-empleados.component';

describe('PermisosMultiplesEmpleadosComponent', () => {
  let component: PermisosMultiplesEmpleadosComponent;
  let fixture: ComponentFixture<PermisosMultiplesEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermisosMultiplesEmpleadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermisosMultiplesEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
