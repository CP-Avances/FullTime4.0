import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteFaltasComponent } from './reporte-faltas.component';

describe('ReporteFaltasComponent', () => {
  let component: ReporteFaltasComponent;
  let fixture: ComponentFixture<ReporteFaltasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteFaltasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteFaltasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
