import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoPermisosComponent } from './tipo-permisos.component';

describe('TipoPermisosComponent', () => {
  let component: TipoPermisosComponent;
  let fixture: ComponentFixture<TipoPermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoPermisosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
