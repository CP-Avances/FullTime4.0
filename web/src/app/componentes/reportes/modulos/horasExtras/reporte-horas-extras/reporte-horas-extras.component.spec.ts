import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHorasExtrasComponent } from './reporte-horas-extras.component';

describe('ReporteHorasExtrasComponent', () => {
  let component: ReporteHorasExtrasComponent;
  let fixture: ComponentFixture<ReporteHorasExtrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteHorasExtrasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteHorasExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
