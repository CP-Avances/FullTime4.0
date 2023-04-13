import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarPermisosEmpleadoComponent } from './solicitar-permisos-empleado.component';

describe('SolicitarPermisosEmpleadoComponent', () => {
  let component: SolicitarPermisosEmpleadoComponent;
  let fixture: ComponentFixture<SolicitarPermisosEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitarPermisosEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitarPermisosEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
