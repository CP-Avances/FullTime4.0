import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarNivelTitulosComponent } from './listar-nivel-titulos.component';

describe('ListarNivelTitulosComponent', () => {
  let component: ListarNivelTitulosComponent;
  let fixture: ComponentFixture<ListarNivelTitulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarNivelTitulosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarNivelTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
