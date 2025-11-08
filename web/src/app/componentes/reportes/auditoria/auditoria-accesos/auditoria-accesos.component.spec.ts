import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriaAccesosComponent } from './auditoria-accesos.component';

describe('AuditoriaAccesosComponent', () => {
  let component: AuditoriaAccesosComponent;
  let fixture: ComponentFixture<AuditoriaAccesosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuditoriaAccesosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditoriaAccesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
