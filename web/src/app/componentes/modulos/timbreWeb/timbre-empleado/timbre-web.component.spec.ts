import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreWebComponent } from './timbre-web.component';

describe('TimbreWebComponent', () => {
  let component: TimbreWebComponent;
  let fixture: ComponentFixture<TimbreWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimbreWebComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimbreWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
