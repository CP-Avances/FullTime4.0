import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatModalidaLaboralComponent } from './cat-modalida-laboral.component';

describe('CatModalidaLaboralComponent', () => {
  let component: CatModalidaLaboralComponent;
  let fixture: ComponentFixture<CatModalidaLaboralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatModalidaLaboralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatModalidaLaboralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
