import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CorreoEmpresaComponent } from './correo-empresa.component';

describe('CorreoEmpresaComponent', () => {
  let component: CorreoEmpresaComponent;
  let fixture: ComponentFixture<CorreoEmpresaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorreoEmpresaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CorreoEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
