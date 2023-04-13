import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHorasExtrasComponent } from './reporte-horas-extras.component';

describe('ReporteHorasExtrasComponent', () => {
  let component: ReporteHorasExtrasComponent;
  let fixture: ComponentFixture<ReporteHorasExtrasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteHorasExtrasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteHorasExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
