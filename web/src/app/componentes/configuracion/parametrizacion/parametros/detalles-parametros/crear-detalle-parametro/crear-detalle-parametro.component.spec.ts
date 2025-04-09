import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDetalleParametroComponent } from './crear-detalle-parametro.component';

describe('CrearDetalleParametroComponent', () => {
  let component: CrearDetalleParametroComponent;
  let fixture: ComponentFixture<CrearDetalleParametroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearDetalleParametroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDetalleParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
