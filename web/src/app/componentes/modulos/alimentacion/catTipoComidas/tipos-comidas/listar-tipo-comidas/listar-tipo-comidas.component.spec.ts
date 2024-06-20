import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTipoComidasComponent } from './listar-tipo-comidas.component';

describe('ListarTipoComidasComponent', () => {
  let component: ListarTipoComidasComponent;
  let fixture: ComponentFixture<ListarTipoComidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarTipoComidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarTipoComidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
