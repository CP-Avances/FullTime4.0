import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarContraseniaComponent } from './confirmar-contrasenia.component';

describe('ConfirmarContraseniaComponent', () => {
  let component: ConfirmarContraseniaComponent;
  let fixture: ComponentFixture<ConfirmarContraseniaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmarContraseniaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarContraseniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
