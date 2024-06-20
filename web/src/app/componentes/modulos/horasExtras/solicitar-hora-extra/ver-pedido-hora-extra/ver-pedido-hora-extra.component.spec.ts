import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPedidoHoraExtraComponent } from './ver-pedido-hora-extra.component';

describe('VerPedidoHoraExtraComponent', () => {
  let component: VerPedidoHoraExtraComponent;
  let fixture: ComponentFixture<VerPedidoHoraExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerPedidoHoraExtraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerPedidoHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
