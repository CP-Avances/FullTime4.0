import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPlanificacionComponent } from './listar-planificacion.component';

describe('ListarPlanificacionComponent', () => {
  let component: ListarPlanificacionComponent;
  let fixture: ComponentFixture<ListarPlanificacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarPlanificacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarPlanificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
