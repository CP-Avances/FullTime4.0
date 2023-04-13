import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPedidoAccionComponent } from './ver-pedido-accion.component';

describe('VerPedidoAccionComponent', () => {
  let component: VerPedidoAccionComponent;
  let fixture: ComponentFixture<VerPedidoAccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerPedidoAccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPedidoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
