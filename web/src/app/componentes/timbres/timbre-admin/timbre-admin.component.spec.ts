import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreAdminComponent } from './timbre-admin.component';

describe('TimbreAdminComponent', () => {
  let component: TimbreAdminComponent;
  let fixture: ComponentFixture<TimbreAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimbreAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimbreAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
