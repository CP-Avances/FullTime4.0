import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPlanComidasComponent } from './editar-plan-comidas.component';

describe('EditarPlanComidasComponent', () => {
  let component: EditarPlanComidasComponent;
  let fixture: ComponentFixture<EditarPlanComidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarPlanComidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPlanComidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
