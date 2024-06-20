import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarNivelTitulosComponent } from './registrar-nivel-titulos.component';

describe('RegistrarNivelTitulosComponent', () => {
  let component: RegistrarNivelTitulosComponent;
  let fixture: ComponentFixture<RegistrarNivelTitulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarNivelTitulosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarNivelTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
