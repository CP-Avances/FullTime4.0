import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTitulosComponent } from './editar-titulos.component';

describe('EditarTitulosComponent', () => {
  let component: EditarTitulosComponent;
  let fixture: ComponentFixture<EditarTitulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarTitulosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
