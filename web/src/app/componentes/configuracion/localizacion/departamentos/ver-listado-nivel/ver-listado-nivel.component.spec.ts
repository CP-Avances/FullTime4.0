import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerListadoNivelComponent } from './ver-listado-nivel.component';

describe('EditarDepartamentoComponent', () => {
  let component: VerListadoNivelComponent;
  let fixture: ComponentFixture<VerListadoNivelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerListadoNivelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerListadoNivelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
