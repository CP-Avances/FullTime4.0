import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreIncompletoComponent } from './timbre-incompleto.component';

describe('TimbreIncompletoComponent', () => {
  let component: TimbreIncompletoComponent;
  let fixture: ComponentFixture<TimbreIncompletoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimbreIncompletoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimbreIncompletoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
