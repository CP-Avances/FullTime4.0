import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerListadoNivelComponent } from './ver-listado-nivel.component';

describe('VerListadoNivelComponent', () => {
  let component: VerListadoNivelComponent;
  let fixture: ComponentFixture<VerListadoNivelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerListadoNivelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerListadoNivelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
