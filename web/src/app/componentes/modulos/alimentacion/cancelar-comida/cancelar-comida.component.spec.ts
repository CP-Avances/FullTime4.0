import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarComidaComponent } from './cancelar-comida.component';

describe('CancelarComidaComponent', () => {
  let component: CancelarComidaComponent;
  let fixture: ComponentFixture<CancelarComidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelarComidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelarComidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
