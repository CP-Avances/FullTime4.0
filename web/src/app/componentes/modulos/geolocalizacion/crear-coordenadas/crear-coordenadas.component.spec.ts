import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCoordenadasComponent } from './crear-coordenadas.component';

describe('CrearCoordenadasComponent', () => {
  let component: CrearCoordenadasComponent;
  let fixture: ComponentFixture<CrearCoordenadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearCoordenadasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearCoordenadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
