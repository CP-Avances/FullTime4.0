import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTimbresMultiplesComponent } from './reporte-timbres-multiples.component';

describe('ReporteTimbresMultiplesComponent', () => {
  let component: ReporteTimbresMultiplesComponent;
  let fixture: ComponentFixture<ReporteTimbresMultiplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteTimbresMultiplesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteTimbresMultiplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
