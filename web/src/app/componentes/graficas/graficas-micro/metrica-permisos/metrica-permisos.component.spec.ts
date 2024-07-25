import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricaPermisosComponent } from './metrica-permisos.component';

describe('MetricaPermisosComponent', () => {
  let component: MetricaPermisosComponent;
  let fixture: ComponentFixture<MetricaPermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricaPermisosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricaPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
