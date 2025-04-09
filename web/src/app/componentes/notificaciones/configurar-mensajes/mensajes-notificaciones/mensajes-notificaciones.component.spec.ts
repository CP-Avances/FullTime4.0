import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajesNotificacionesComponent } from './mensajes-notificaciones.component';

describe('MensajesNotificacionesComponent', () => {
  let component: MensajesNotificacionesComponent;
  let fixture: ComponentFixture<MensajesNotificacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MensajesNotificacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajesNotificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
