import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDepaUserComponent } from './editar-depa-user.component';

describe('EditarDepaUserComponent', () => {
  let component: EditarDepaUserComponent;
  let fixture: ComponentFixture<EditarDepaUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarDepaUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarDepaUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
