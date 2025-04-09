import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatVacunasComponent } from './cat-vacunas.component';

describe('CatVacunasComponent', () => {
  let component: CatVacunasComponent;
  let fixture: ComponentFixture<CatVacunasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatVacunasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatVacunasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
