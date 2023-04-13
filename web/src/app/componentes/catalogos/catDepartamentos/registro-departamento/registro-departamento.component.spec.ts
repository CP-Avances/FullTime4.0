import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroDepartamentoComponent } from './registro-departamento.component';

describe('RegistroDepartamentoComponent', () => {
  let component: RegistroDepartamentoComponent;
  let fixture: ComponentFixture<RegistroDepartamentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroDepartamentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroDepartamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
