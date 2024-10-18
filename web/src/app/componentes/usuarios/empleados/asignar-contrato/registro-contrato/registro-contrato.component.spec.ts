import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroContratoComponent } from './registro-contrato.component';

describe('RegistroContratoComponent', () => {
  let component: RegistroContratoComponent;
  let fixture: ComponentFixture<RegistroContratoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroContratoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
