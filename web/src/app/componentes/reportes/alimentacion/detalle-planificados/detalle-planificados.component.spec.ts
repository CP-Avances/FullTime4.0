import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePlanificadosComponent } from './detalle-planificados.component';

describe('DetallePlanificadosComponent', () => {
  let component: DetallePlanificadosComponent;
  let fixture: ComponentFixture<DetallePlanificadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetallePlanificadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePlanificadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
