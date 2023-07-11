import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanComidasComponent } from './plan-comidas.component';

describe('PlanComidasComponent', () => {
  let component: PlanComidasComponent;
  let fixture: ComponentFixture<PlanComidasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanComidasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanComidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
