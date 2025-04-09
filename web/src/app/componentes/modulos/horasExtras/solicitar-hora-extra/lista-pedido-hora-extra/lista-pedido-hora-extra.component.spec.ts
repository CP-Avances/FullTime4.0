import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPedidoHoraExtraComponent } from './lista-pedido-hora-extra.component';

describe('ListaPedidoHoraExtraComponent', () => {
  let component: ListaPedidoHoraExtraComponent;
  let fixture: ComponentFixture<ListaPedidoHoraExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaPedidoHoraExtraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPedidoHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
