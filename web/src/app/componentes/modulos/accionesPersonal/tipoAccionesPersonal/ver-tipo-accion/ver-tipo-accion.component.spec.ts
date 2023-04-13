import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerTipoAccionComponent } from './ver-tipo-accion.component';

describe('VerTipoAccionComponent', () => {
  let component: VerTipoAccionComponent;
  let fixture: ComponentFixture<VerTipoAccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerTipoAccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerTipoAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
