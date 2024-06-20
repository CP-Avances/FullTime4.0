import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarFraseComponent } from './recuperar-frase.component';

describe('RecuperarFraseComponent', () => {
  let component: RecuperarFraseComponent;
  let fixture: ComponentFixture<RecuperarFraseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecuperarFraseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarFraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
