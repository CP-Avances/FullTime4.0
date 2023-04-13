import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCoordenadasComponent } from './listar-coordenadas.component';

describe('ListarCoordenadasComponent', () => {
  let component: ListarCoordenadasComponent;
  let fixture: ComponentFixture<ListarCoordenadasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarCoordenadasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarCoordenadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
