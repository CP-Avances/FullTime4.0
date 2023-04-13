import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoAccionComponent } from './editar-tipo-accion.component';

describe('EditarTipoAccionComponent', () => {
  let component: EditarTipoAccionComponent;
  let fixture: ComponentFixture<EditarTipoAccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarTipoAccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarTipoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
