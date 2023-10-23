import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAtrasosMultiplesComponent } from './reporte-atrasos-multiples.component';

describe('ReporteAtrasosMultiplesComponent', () => {
  let component: ReporteAtrasosMultiplesComponent;
  let fixture: ComponentFixture<ReporteAtrasosMultiplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteAtrasosMultiplesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteAtrasosMultiplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
