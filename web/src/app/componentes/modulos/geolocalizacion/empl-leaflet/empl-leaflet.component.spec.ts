import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplLeafletComponent } from './empl-leaflet.component';

describe('EmplLeafletComponent', () => {
  let component: EmplLeafletComponent;
  let fixture: ComponentFixture<EmplLeafletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmplLeafletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmplLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
