import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricaVacacionesComponent } from './metrica-vacaciones.component';

describe('MetricaVacacionesComponent', () => {
  let component: MetricaVacacionesComponent;
  let fixture: ComponentFixture<MetricaVacacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricaVacacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricaVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
