import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricaAtrasosComponent } from './metrica-atrasos.component';

describe('MetricaAtrasosComponent', () => {
  let component: MetricaAtrasosComponent;
  let fixture: ComponentFixture<MetricaAtrasosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricaAtrasosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricaAtrasosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
