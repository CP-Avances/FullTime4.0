import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalDepartamentoComponent } from './principal-departamento.component';

describe('PrincipalDepartamentoComponent', () => {
  let component: PrincipalDepartamentoComponent;
  let fixture: ComponentFixture<PrincipalDepartamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrincipalDepartamentoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalDepartamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
