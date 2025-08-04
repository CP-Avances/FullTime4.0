import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePeriodosComponent } from './reporte-periodos.component';

describe('ReportePeriodosComponent', () => {
  let component: ReportePeriodosComponent;
  let fixture: ComponentFixture<ReportePeriodosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportePeriodosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportePeriodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
