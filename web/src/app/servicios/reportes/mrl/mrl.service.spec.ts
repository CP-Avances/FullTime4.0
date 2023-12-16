import { TestBed } from '@angular/core/testing';

import { MrlService } from './mrl.service';

describe('MrlService', () => {
  let service: MrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
