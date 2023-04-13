import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColoresEmpresaComponent } from './colores-empresa.component';

describe('ColoresEmpresaComponent', () => {
  let component: ColoresEmpresaComponent;
  let fixture: ComponentFixture<ColoresEmpresaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColoresEmpresaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColoresEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
