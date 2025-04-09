import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OlvidarContraseniaComponent } from './olvidar-contrasenia.component';

describe('OlvidarContraseniaComponent', () => {
  let component: OlvidarContraseniaComponent;
  let fixture: ComponentFixture<OlvidarContraseniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OlvidarContraseniaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OlvidarContraseniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
