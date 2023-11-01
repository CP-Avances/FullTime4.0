import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTiempoAlimentacionComponent } from './reporte-tiempo-alimentacion.component';

describe('ReporteTiempoAlimentacionComponent', () => {
  let component: ReporteTiempoAlimentacionComponent;
  let fixture: ComponentFixture<ReporteTiempoAlimentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteTiempoAlimentacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteTiempoAlimentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
