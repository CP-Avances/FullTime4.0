import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanHoraExtraAutorizaComponent } from './plan-hora-extra-autoriza.component';

describe('PlanHoraExtraAutorizaComponent', () => {
  let component: PlanHoraExtraAutorizaComponent;
  let fixture: ComponentFixture<PlanHoraExtraAutorizaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanHoraExtraAutorizaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanHoraExtraAutorizaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
