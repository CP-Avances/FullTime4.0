import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarBirthdayComponent } from './registrar-birthday.component';

describe('RegistrarBirthdayComponent', () => {
  let component: RegistrarBirthdayComponent;
  let fixture: ComponentFixture<RegistrarBirthdayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarBirthdayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarBirthdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
