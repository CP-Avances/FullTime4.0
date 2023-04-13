import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTipoAccionComponent } from './listar-tipo-accion.component';

describe('ListarTipoAccionComponent', () => {
  let component: ListarTipoAccionComponent;
  let fixture: ComponentFixture<ListarTipoAccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarTipoAccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarTipoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
