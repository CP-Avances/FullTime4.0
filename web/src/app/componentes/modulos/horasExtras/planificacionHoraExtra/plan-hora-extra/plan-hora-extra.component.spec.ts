import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanHoraExtraComponent } from './plan-hora-extra.component';

describe('PlanHoraExtraComponent', () => {
  let component: PlanHoraExtraComponent;
  let fixture: ComponentFixture<PlanHoraExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanHoraExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
