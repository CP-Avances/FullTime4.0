import { TestBed } from '@angular/core/testing';

import { HorasExtrasService } from './horas-extras.service';

describe('HorasExtrasService', () => {
  let service: HorasExtrasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorasExtrasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
