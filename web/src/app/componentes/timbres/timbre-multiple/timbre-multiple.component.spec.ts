import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreMultipleComponent } from './timbre-multiple.component';

describe('TimbreMultipleComponent', () => {
  let component: TimbreMultipleComponent;
  let fixture: ComponentFixture<TimbreMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimbreMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimbreMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
