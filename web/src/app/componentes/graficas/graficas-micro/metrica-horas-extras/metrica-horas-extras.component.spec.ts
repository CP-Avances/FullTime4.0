import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricaHorasExtrasComponent } from './metrica-horas-extras.component';

describe('MetricaHorasExtrasComponent', () => {
  let component: MetricaHorasExtrasComponent;
  let fixture: ComponentFixture<MetricaHorasExtrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricaHorasExtrasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricaHorasExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
