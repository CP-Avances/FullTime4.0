import { TestBed } from '@angular/core/testing';

import { NotiAutorizacionesService } from './noti-autorizaciones.service';

describe('NotiAutorizacionesService', () => {
  let service: NotiAutorizacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotiAutorizacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
