import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTimbresComponent } from './reporte-timbres.component';

describe('ReporteTimbresComponent', () => {
  let component: ReporteTimbresComponent;
  let fixture: ComponentFixture<ReporteTimbresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteTimbresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteTimbresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
