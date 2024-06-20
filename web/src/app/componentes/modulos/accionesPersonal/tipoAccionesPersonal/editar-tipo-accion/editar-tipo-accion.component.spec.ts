import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoAccionComponent } from './editar-tipo-accion.component';

describe('EditarTipoAccionComponent', () => {
  let component: EditarTipoAccionComponent;
  let fixture: ComponentFixture<EditarTipoAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarTipoAccionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTipoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
