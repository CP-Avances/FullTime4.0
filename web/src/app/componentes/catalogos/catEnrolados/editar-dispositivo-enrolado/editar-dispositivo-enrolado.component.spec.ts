import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDispositivoEnroladoComponent } from './editar-dispositivo-enrolado.component';

describe('EditarDispositivoEnroladoComponent', () => {
  let component: EditarDispositivoEnroladoComponent;
  let fixture: ComponentFixture<EditarDispositivoEnroladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarDispositivoEnroladoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarDispositivoEnroladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
