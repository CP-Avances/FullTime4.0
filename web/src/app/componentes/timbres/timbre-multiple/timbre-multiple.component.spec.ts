import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreMultipleComponent } from './timbre-multiple.component';

describe('TimbreMultipleComponent', () => {
  let component: TimbreMultipleComponent;
  let fixture: ComponentFixture<TimbreMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimbreMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimbreMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
