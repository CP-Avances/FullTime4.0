import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarPlanificacionComponent } from './buscar-planificacion.component';

describe('BuscarPlanificacionComponent', () => {
  let component: BuscarPlanificacionComponent;
  let fixture: ComponentFixture<BuscarPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarPlanificacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarPlanificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
