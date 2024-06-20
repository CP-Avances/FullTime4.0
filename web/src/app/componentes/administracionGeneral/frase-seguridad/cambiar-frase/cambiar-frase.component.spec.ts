import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarFraseComponent } from './cambiar-frase.component';

describe('CambiarFraseComponent', () => {
  let component: CambiarFraseComponent;
  let fixture: ComponentFixture<CambiarFraseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CambiarFraseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiarFraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
