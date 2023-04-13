import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDetallePlanComponent } from './editar-detalle-plan.component';

describe('EditarDetallePlanComponent', () => {
  let component: EditarDetallePlanComponent;
  let fixture: ComponentFixture<EditarDetallePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarDetallePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarDetallePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
