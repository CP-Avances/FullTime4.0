import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDocumentacionComponent } from './ver-documentacion.component';

describe('VerDocumentacionComponent', () => {
  let component: VerDocumentacionComponent;
  let fixture: ComponentFixture<VerDocumentacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerDocumentacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerDocumentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
