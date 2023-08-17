import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoPermisosComponent } from './tipo-permisos.component';

describe('TipoPermisosComponent', () => {
  let component: TipoPermisosComponent;
  let fixture: ComponentFixture<TipoPermisosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TipoPermisosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
