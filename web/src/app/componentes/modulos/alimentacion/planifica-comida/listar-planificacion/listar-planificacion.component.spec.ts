import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPlanificacionComponent } from './listar-planificacion.component';

describe('ListarPlanificacionComponent', () => {
  let component: ListarPlanificacionComponent;
  let fixture: ComponentFixture<ListarPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarPlanificacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPlanificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
