import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricaAtrasosComponent } from './metrica-atrasos.component';

describe('MetricaAtrasosComponent', () => {
  let component: MetricaAtrasosComponent;
  let fixture: ComponentFixture<MetricaAtrasosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricaAtrasosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricaAtrasosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
