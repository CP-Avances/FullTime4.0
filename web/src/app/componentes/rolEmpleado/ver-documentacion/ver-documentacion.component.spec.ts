import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDocumentacionComponent } from './ver-documentacion.component';

describe('VerDocumentacionComponent', () => {
  let component: VerDocumentacionComponent;
  let fixture: ComponentFixture<VerDocumentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerDocumentacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerDocumentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
