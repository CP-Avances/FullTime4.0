import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatTipoCargosComponent } from './cat-tipo-cargos.component';

describe('CatTipoCargosComponent', () => {
  let component: CatTipoCargosComponent;
  let fixture: ComponentFixture<CatTipoCargosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatTipoCargosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatTipoCargosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
