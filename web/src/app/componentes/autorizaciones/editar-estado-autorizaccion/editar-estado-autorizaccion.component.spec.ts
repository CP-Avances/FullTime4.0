import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEstadoAutorizaccionComponent } from './editar-estado-autorizaccion.component';

describe('EditarEstadoAutorizaccionComponent', () => {
  let component: EditarEstadoAutorizaccionComponent;
  let fixture: ComponentFixture<EditarEstadoAutorizaccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarEstadoAutorizaccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarEstadoAutorizaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
