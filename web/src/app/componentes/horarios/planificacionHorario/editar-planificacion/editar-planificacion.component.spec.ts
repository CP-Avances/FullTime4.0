import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPlanificacionComponent } from './editar-planificacion.component';

describe('EditarPlanificacionComponent', () => {
  let component: EditarPlanificacionComponent;
  let fixture: ComponentFixture<EditarPlanificacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarPlanificacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarPlanificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
