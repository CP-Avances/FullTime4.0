import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarGradoComponent } from './editar-grado.component';

describe('EditarGradoComponent', () => {
  let component: EditarGradoComponent;
  let fixture: ComponentFixture<EditarGradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarGradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
