import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerBirthdayComponent } from './ver-birthday.component';

describe('VerBirthdayComponent', () => {
  let component: VerBirthdayComponent;
  let fixture: ComponentFixture<VerBirthdayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerBirthdayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerBirthdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
