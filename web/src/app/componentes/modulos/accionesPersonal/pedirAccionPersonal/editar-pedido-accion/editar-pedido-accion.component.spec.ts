import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPedidoAccionComponent } from './editar-pedido-accion.component';

describe('EditarPedidoAccionComponent', () => {
  let component: EditarPedidoAccionComponent;
  let fixture: ComponentFixture<EditarPedidoAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarPedidoAccionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPedidoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
