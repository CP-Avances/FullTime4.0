import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreVirtualComponent } from './timbre-virtual.component';

describe('TimbreVirtualComponent', () => {
  let component: TimbreVirtualComponent;
  let fixture: ComponentFixture<TimbreVirtualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimbreVirtualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimbreVirtualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
