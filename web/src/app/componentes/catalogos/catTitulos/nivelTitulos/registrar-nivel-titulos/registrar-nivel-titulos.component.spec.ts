import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarNivelTitulosComponent } from './registrar-nivel-titulos.component';

describe('RegistrarNivelTitulosComponent', () => {
  let component: RegistrarNivelTitulosComponent;
  let fixture: ComponentFixture<RegistrarNivelTitulosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarNivelTitulosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarNivelTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
