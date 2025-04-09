import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTipoAccionComponent } from './listar-tipo-accion.component';

describe('ListarTipoAccionComponent', () => {
  let component: ListarTipoAccionComponent;
  let fixture: ComponentFixture<ListarTipoAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarTipoAccionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarTipoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
