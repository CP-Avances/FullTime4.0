import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDepartamentoComponent } from './ver-departamento.component';

describe('VerDepartamentoComponent', () => {
  let component: VerDepartamentoComponent;
  let fixture: ComponentFixture<VerDepartamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerDepartamentoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerDepartamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
