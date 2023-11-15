import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteResumenAsistenciaComponent } from './reporte-resumen-asistencia.component';

describe('ReporteResumenAsistenciaComponent', () => {
  let component: ReporteResumenAsistenciaComponent;
  let fixture: ComponentFixture<ReporteResumenAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteResumenAsistenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteResumenAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
