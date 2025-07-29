import { TestBed } from '@angular/core/testing';

import { PdfServicesService } from './pdf.services.service';

describe('PdfServicesService', () => {
  let service: PdfServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
