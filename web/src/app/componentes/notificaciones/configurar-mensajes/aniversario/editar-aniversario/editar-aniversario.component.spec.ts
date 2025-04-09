import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAniversarioComponent } from './editar-aniversario.component';

describe('EditarAniversarioComponent', () => {
  let component: EditarAniversarioComponent;
  let fixture: ComponentFixture<EditarAniversarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarAniversarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarAniversarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
