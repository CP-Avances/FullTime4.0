import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriaSistemaComponent } from './auditoria-sistema.component';

describe('AuditoriaSistemaComponent', () => {
  let component: AuditoriaSistemaComponent;
  let fixture: ComponentFixture<AuditoriaSistemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuditoriaSistemaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditoriaSistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
