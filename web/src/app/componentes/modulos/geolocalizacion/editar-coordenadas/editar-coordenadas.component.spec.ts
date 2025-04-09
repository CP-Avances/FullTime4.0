import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCoordenadasComponent } from './editar-coordenadas.component';

describe('EditarCoordenadasComponent', () => {
  let component: EditarCoordenadasComponent;
  let fixture: ComponentFixture<EditarCoordenadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarCoordenadasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCoordenadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
