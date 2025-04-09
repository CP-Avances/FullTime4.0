import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAtrasosMultiplesComponent } from './reporte-atrasos-multiples.component';

describe('ReporteAtrasosMultiplesComponent', () => {
  let component: ReporteAtrasosMultiplesComponent;
  let fixture: ComponentFixture<ReporteAtrasosMultiplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteAtrasosMultiplesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteAtrasosMultiplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
