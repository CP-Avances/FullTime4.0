import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatDiscapacidadComponent } from './cat-discapacidad.component';

describe('CatDiscapacidadComponent', () => {
  let component: CatDiscapacidadComponent;
  let fixture: ComponentFixture<CatDiscapacidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatDiscapacidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatDiscapacidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
