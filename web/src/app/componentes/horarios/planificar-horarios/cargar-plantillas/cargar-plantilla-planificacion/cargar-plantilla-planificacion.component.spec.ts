import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarPlantillaPlanificacionComponent } from './cargar-plantilla-planificacion.component';

describe('CargarPlantillaPlanificacionComponent', () => {
  let component: CargarPlantillaPlanificacionComponent;
  let fixture: ComponentFixture<CargarPlantillaPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargarPlantillaPlanificacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargarPlantillaPlanificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
