import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDepartamentoComponent } from './ver-departamento.component';

describe('EditarDepartamentoComponent', () => {
  let component: VerDepartamentoComponent;
  let fixture: ComponentFixture<VerDepartamentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerDepartamentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerDepartamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
