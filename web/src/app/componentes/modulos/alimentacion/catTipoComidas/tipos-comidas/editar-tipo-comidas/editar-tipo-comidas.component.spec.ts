import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoComidasComponent } from './editar-tipo-comidas.component';

describe('EditarTipoComidasComponent', () => {
  let component: EditarTipoComidasComponent;
  let fixture: ComponentFixture<EditarTipoComidasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarTipoComidasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarTipoComidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
