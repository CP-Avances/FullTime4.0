import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerTipoPermisoComponent } from './ver-tipo-permiso.component';

describe('VerTipoPermisoComponent', () => {
  let component: VerTipoPermisoComponent;
  let fixture: ComponentFixture<VerTipoPermisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerTipoPermisoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerTipoPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
