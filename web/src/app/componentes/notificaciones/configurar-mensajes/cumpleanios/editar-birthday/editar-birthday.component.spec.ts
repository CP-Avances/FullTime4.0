import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarBirthdayComponent } from './editar-birthday.component';

describe('EditarBirthdayComponent', () => {
  let component: EditarBirthdayComponent;
  let fixture: ComponentFixture<EditarBirthdayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarBirthdayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarBirthdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
