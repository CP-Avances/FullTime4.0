import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComidasSolicitadasEmpleadoComponent } from './comidas-solicitadas-empleado.component';

describe('ComidasSolicitadasEmpleadoComponent', () => {
  let component: ComidasSolicitadasEmpleadoComponent;
  let fixture: ComponentFixture<ComidasSolicitadasEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComidasSolicitadasEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComidasSolicitadasEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
