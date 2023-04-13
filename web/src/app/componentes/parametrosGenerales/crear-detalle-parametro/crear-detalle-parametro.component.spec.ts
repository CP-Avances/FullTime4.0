import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDetalleParametroComponent } from './crear-detalle-parametro.component';

describe('CrearDetalleParametroComponent', () => {
  let component: CrearDetalleParametroComponent;
  let fixture: ComponentFixture<CrearDetalleParametroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearDetalleParametroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearDetalleParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
