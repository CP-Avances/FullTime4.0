import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCoordenadasComponent } from './listar-coordenadas.component';

describe('ListarCoordenadasComponent', () => {
  let component: ListarCoordenadasComponent;
  let fixture: ComponentFixture<ListarCoordenadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarCoordenadasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarCoordenadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
