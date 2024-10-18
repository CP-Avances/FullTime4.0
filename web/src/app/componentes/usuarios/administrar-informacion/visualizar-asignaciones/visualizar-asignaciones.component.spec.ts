import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarAsignacionesComponent } from './visualizar-asignaciones.component';

describe('VisualizarAsignacionesComponent', () => {
  let component: VisualizarAsignacionesComponent;
  let fixture: ComponentFixture<VisualizarAsignacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizarAsignacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizarAsignacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
