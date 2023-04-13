import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerBirthdayComponent } from './ver-birthday.component';

describe('VerBirthdayComponent', () => {
  let component: VerBirthdayComponent;
  let fixture: ComponentFixture<VerBirthdayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerBirthdayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerBirthdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
