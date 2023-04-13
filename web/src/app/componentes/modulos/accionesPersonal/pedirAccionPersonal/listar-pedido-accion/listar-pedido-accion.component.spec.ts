import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPedidoAccionComponent } from './listar-pedido-accion.component';

describe('ListarPedidoAccionComponent', () => {
  let component: ListarPedidoAccionComponent;
  let fixture: ComponentFixture<ListarPedidoAccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarPedidoAccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarPedidoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
