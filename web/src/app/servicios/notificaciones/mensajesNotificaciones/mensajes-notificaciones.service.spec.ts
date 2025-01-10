import { TestBed } from '@angular/core/testing';

import { MensajesNotificacionesService } from './mensajes-notificaciones.service';

describe('MensajesNotificacionesService', () => {
  let service: MensajesNotificacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MensajesNotificacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
