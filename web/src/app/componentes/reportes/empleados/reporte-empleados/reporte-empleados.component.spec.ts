import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteEmpleadosComponent } from './reporte-empleados.component';

describe('ReporteEmpleadosComponent', () => {
  let component: ReporteEmpleadosComponent;
  let fixture: ComponentFixture<ReporteEmpleadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteEmpleadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
