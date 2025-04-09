import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarPlantillaComponent } from './cargar-plantilla.component';

describe('CargarPlantillaComponent', () => {
  let component: CargarPlantillaComponent;
  let fixture: ComponentFixture<CargarPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargarPlantillaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargarPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
