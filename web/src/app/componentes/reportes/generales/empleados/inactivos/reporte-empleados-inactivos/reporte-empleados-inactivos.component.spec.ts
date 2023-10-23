import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteEmpleadosInactivosComponent } from './reporte-empleados-inactivos.component';

describe('ReporteEmpleadosInactivosComponent', () => {
  let component: ReporteEmpleadosInactivosComponent;
  let fixture: ComponentFixture<ReporteEmpleadosInactivosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteEmpleadosInactivosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteEmpleadosInactivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
