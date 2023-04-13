import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoHoraExtraComponent } from './pedido-hora-extra.component';

describe('PedidoHoraExtraComponent', () => {
  let component: PedidoHoraExtraComponent;
  let fixture: ComponentFixture<PedidoHoraExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoHoraExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
