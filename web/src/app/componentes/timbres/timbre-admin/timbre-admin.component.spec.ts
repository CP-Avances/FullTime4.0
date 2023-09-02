import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreAdminComponent } from './timbre-admin.component';

describe('TimbreAdminComponent', () => {
  let component: TimbreAdminComponent;
  let fixture: ComponentFixture<TimbreAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimbreAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimbreAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
