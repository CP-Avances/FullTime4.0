import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHorasPedidasComponent } from './reporte-horas-pedidas.component';

describe('ReporteHorasPedidasComponent', () => {
  let component: ReporteHorasPedidasComponent;
  let fixture: ComponentFixture<ReporteHorasPedidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteHorasPedidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteHorasPedidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
