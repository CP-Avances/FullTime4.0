import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPlanHoraExtraComponent } from './editar-plan-hora-extra.component';

describe('EditarPlanHoraExtraComponent', () => {
  let component: EditarPlanHoraExtraComponent;
  let fixture: ComponentFixture<EditarPlanHoraExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarPlanHoraExtraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPlanHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
