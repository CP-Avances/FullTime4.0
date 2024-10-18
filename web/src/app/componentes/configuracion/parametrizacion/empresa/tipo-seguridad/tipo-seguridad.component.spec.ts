import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoSeguridadComponent } from './tipo-seguridad.component';

describe('TipoSeguridadComponent', () => {
  let component: TipoSeguridadComponent;
  let fixture: ComponentFixture<TipoSeguridadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoSeguridadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoSeguridadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
