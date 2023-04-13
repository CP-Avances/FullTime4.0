import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAtrasosComponent } from './reporte-atrasos.component';

describe('ReporteAtrasosComponent', () => {
  let component: ReporteAtrasosComponent;
  let fixture: ComponentFixture<ReporteAtrasosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteAtrasosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteAtrasosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
