import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPlanHoraExtraComponent } from './editar-plan-hora-extra.component';

describe('EditarPlanHoraExtraComponent', () => {
  let component: EditarPlanHoraExtraComponent;
  let fixture: ComponentFixture<EditarPlanHoraExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarPlanHoraExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarPlanHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
