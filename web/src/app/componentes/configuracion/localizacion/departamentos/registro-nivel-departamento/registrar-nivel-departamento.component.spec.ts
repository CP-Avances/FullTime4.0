import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarNivelDepartamentoComponent } from './registrar-nivel-departamento.component';

describe('EditarDepartamentoComponent', () => {
  let component: RegistrarNivelDepartamentoComponent;
  let fixture: ComponentFixture<RegistrarNivelDepartamentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarNivelDepartamentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarNivelDepartamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
