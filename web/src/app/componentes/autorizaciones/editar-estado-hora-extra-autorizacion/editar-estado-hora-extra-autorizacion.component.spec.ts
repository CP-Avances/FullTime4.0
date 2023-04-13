import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEstadoHoraExtraAutorizacionComponent } from './editar-estado-hora-extra-autorizacion.component';

describe('EditarEstadoHoraExtraAutorizacionComponent', () => {
  let component: EditarEstadoHoraExtraAutorizacionComponent;
  let fixture: ComponentFixture<EditarEstadoHoraExtraAutorizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarEstadoHoraExtraAutorizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarEstadoHoraExtraAutorizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
