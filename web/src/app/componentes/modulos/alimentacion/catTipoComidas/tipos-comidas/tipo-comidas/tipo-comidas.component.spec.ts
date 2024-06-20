import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoComidasComponent } from './tipo-comidas.component';

describe('TipoComidasComponent', () => {
  let component: TipoComidasComponent;
  let fixture: ComponentFixture<TipoComidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoComidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoComidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
