import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraseSeguridadComponent } from './frase-seguridad.component';

describe('FraseSeguridadComponent', () => {
  let component: FraseSeguridadComponent;
  let fixture: ComponentFixture<FraseSeguridadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FraseSeguridadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FraseSeguridadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
