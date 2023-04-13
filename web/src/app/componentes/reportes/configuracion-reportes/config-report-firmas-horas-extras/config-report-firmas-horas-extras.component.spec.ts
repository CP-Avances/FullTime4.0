import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigReportFirmasHorasExtrasComponent } from './config-report-firmas-horas-extras.component';

describe('ConfigReportFirmasHorasExtrasComponent', () => {
  let component: ConfigReportFirmasHorasExtrasComponent;
  let fixture: ComponentFixture<ConfigReportFirmasHorasExtrasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigReportFirmasHorasExtrasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigReportFirmasHorasExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
