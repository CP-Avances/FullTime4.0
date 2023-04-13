import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPedidoAccionComponent } from './crear-pedido-accion.component';

describe('CrearPedidoAccionComponent', () => {
  let component: CrearPedidoAccionComponent;
  let fixture: ComponentFixture<CrearPedidoAccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearPedidoAccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPedidoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
