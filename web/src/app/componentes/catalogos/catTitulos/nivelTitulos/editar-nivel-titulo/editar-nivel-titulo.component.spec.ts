import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarNivelTituloComponent } from './editar-nivel-titulo.component';

describe('EditarNivelTituloComponent', () => {
  let component: EditarNivelTituloComponent;
  let fixture: ComponentFixture<EditarNivelTituloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarNivelTituloComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarNivelTituloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
