import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerVacunasComponent } from './ver-vacunas.component';

describe('VerVacunasComponent', () => {
  let component: VerVacunasComponent;
  let fixture: ComponentFixture<VerVacunasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerVacunasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerVacunasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
