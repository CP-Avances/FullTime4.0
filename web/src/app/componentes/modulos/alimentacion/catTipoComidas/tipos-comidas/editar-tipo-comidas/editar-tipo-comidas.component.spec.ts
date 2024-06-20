import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoComidasComponent } from './editar-tipo-comidas.component';

describe('EditarTipoComidasComponent', () => {
  let component: EditarTipoComidasComponent;
  let fixture: ComponentFixture<EditarTipoComidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarTipoComidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTipoComidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
