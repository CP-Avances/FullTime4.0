import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePuntualidadComponent } from './reporte-puntualidad.component';

describe('ReportePuntualidadComponent', () => {
  let component: ReportePuntualidadComponent;
  let fixture: ComponentFixture<ReportePuntualidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportePuntualidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportePuntualidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
