import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaConsolidadoComponent } from './asistencia-consolidado.component';

describe('AsistenciaConsolidadoComponent', () => {
  let component: AsistenciaConsolidadoComponent;
  let fixture: ComponentFixture<AsistenciaConsolidadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsistenciaConsolidadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsistenciaConsolidadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
