import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarPermisoComponent } from './cancelar-permiso.component';

describe('CancelarPermisoComponent', () => {
  let component: CancelarPermisoComponent;
  let fixture: ComponentFixture<CancelarPermisoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelarPermisoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelarPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
