import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoHoraExtraComponent } from './pedido-hora-extra.component';

describe('PedidoHoraExtraComponent', () => {
  let component: PedidoHoraExtraComponent;
  let fixture: ComponentFixture<PedidoHoraExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PedidoHoraExtraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
