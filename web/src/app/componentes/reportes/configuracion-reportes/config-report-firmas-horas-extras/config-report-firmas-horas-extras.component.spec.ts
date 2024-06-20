import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigReportFirmasHorasExtrasComponent } from './config-report-firmas-horas-extras.component';

describe('ConfigReportFirmasHorasExtrasComponent', () => {
  let component: ConfigReportFirmasHorasExtrasComponent;
  let fixture: ComponentFixture<ConfigReportFirmasHorasExtrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigReportFirmasHorasExtrasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigReportFirmasHorasExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
