import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPedidoHoraExtraComponent } from './ver-pedido-hora-extra.component';

describe('VerPedidoHoraExtraComponent', () => {
  let component: VerPedidoHoraExtraComponent;
  let fixture: ComponentFixture<VerPedidoHoraExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerPedidoHoraExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPedidoHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
