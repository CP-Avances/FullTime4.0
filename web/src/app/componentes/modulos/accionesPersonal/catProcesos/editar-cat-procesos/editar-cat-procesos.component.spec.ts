import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCatProcesosComponent } from './editar-cat-procesos.component';

describe('EditarCatProcesosComponent', () => {
  let component: EditarCatProcesosComponent;
  let fixture: ComponentFixture<EditarCatProcesosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarCatProcesosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCatProcesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
