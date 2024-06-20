import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarBirthdayComponent } from './registrar-birthday.component';

describe('RegistrarBirthdayComponent', () => {
  let component: RegistrarBirthdayComponent;
  let fixture: ComponentFixture<RegistrarBirthdayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarBirthdayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarBirthdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
