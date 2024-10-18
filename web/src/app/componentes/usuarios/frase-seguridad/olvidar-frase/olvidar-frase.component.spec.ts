import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OlvidarFraseComponent } from './olvidar-frase.component';

describe('OlvidarFraseComponent', () => {
  let component: OlvidarFraseComponent;
  let fixture: ComponentFixture<OlvidarFraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OlvidarFraseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OlvidarFraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
