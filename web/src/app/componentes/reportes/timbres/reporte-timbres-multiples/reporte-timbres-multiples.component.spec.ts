import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTimbresMultiplesComponent } from './reporte-timbres-multiples.component';

describe('ReporteTimbresMultiplesComponent', () => {
  let component: ReporteTimbresMultiplesComponent;
  let fixture: ComponentFixture<ReporteTimbresMultiplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteTimbresMultiplesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteTimbresMultiplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
