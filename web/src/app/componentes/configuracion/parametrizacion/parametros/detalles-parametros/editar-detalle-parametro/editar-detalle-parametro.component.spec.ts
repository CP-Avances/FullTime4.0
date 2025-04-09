import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDetalleParametroComponent } from './editar-detalle-parametro.component';

describe('EditarDetalleParametroComponent', () => {
  let component: EditarDetalleParametroComponent;
  let fixture: ComponentFixture<EditarDetalleParametroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarDetalleParametroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarDetalleParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
