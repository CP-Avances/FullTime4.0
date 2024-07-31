import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarObservacionComponent } from './visualizar-observacion.component';

describe('VisualizarObservacionComponent', () => {
  let component: VisualizarObservacionComponent;
  let fixture: ComponentFixture<VisualizarObservacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizarObservacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizarObservacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
