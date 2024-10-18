import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEmpresaComponent } from './ver-empresa.component';

describe('VerEmpresaComponent', () => {
  let component: VerEmpresaComponent;
  let fixture: ComponentFixture<VerEmpresaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerEmpresaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
