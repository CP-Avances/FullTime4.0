import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPedidoAccionComponent } from './crear-pedido-accion.component';

describe('CrearPedidoAccionComponent', () => {
  let component: CrearPedidoAccionComponent;
  let fixture: ComponentFixture<CrearPedidoAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearPedidoAccionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPedidoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
