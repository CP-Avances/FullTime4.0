import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEstadoAutorizaccionComponent } from './editar-estado-autorizaccion.component';

describe('EditarEstadoAutorizaccionComponent', () => {
  let component: EditarEstadoAutorizaccionComponent;
  let fixture: ComponentFixture<EditarEstadoAutorizaccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarEstadoAutorizaccionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEstadoAutorizaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
