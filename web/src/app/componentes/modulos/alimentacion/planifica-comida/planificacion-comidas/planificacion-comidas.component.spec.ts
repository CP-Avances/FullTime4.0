import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionComidasComponent } from './planificacion-comidas.component';

describe('PlanificacionComidasComponent', () => {
  let component: PlanificacionComidasComponent;
  let fixture: ComponentFixture<PlanificacionComidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanificacionComidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanificacionComidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
