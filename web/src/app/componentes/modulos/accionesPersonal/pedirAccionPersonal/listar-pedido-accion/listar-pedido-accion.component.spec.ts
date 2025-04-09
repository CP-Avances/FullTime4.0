import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPedidoAccionComponent } from './listar-pedido-accion.component';

describe('ListarPedidoAccionComponent', () => {
  let component: ListarPedidoAccionComponent;
  let fixture: ComponentFixture<ListarPedidoAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarPedidoAccionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPedidoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
