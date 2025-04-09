import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHorasTrabajadasComponent } from './reporte-horas-trabajadas.component';

describe('ReporteHorasTrabajadasComponent', () => {
  let component: ReporteHorasTrabajadasComponent;
  let fixture: ComponentFixture<ReporteHorasTrabajadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteHorasTrabajadasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteHorasTrabajadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
