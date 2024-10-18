import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarNivelDepartamentoComponent } from './registrar-nivel-departamento.component';

describe('RegistrarNivelDepartamentoComponent', () => {
  let component: RegistrarNivelDepartamentoComponent;
  let fixture: ComponentFixture<RegistrarNivelDepartamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarNivelDepartamentoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarNivelDepartamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
