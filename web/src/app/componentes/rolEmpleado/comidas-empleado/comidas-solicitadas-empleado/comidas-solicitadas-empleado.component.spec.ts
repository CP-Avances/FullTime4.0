import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComidasSolicitadasEmpleadoComponent } from './comidas-solicitadas-empleado.component';

describe('ComidasSolicitadasEmpleadoComponent', () => {
  let component: ComidasSolicitadasEmpleadoComponent;
  let fixture: ComponentFixture<ComidasSolicitadasEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComidasSolicitadasEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComidasSolicitadasEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
