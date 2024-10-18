import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoSeguridadComponent } from './tipo-seguridad.component';

describe('TipoSeguridadComponent', () => {
  let component: TipoSeguridadComponent;
  let fixture: ComponentFixture<TipoSeguridadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TipoSeguridadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoSeguridadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
