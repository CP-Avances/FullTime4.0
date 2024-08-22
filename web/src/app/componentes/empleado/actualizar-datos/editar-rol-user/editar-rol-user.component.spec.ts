import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarRolUserComponent } from './editar-rol-user.component';

describe('EditarRolUserComponent', () => {
  let component: EditarRolUserComponent;
  let fixture: ComponentFixture<EditarRolUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarRolUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarRolUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
