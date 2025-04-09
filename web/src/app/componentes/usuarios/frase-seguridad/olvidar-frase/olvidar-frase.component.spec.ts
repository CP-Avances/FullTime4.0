import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OlvidarFraseComponent } from './olvidar-frase.component';

describe('OlvidarFraseComponent', () => {
  let component: OlvidarFraseComponent;
  let fixture: ComponentFixture<OlvidarFraseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OlvidarFraseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OlvidarFraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
