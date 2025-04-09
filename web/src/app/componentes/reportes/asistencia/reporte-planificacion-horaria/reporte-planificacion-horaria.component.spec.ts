import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePlanificacionHorariaComponent } from './reporte-planificacion-horaria.component';

describe('ReportePlanificacionHorariaComponent', () => {
  let component: ReportePlanificacionHorariaComponent;
  let fixture: ComponentFixture<ReportePlanificacionHorariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportePlanificacionHorariaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportePlanificacionHorariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
