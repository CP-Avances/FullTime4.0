import { TestBed } from '@angular/core/testing';

import { FaltasService } from './faltas.service';

describe('FaltasService', () => {
  let service: FaltasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaltasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
