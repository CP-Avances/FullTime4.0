import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcacionesEmpMacroComponent } from './marcaciones-emp-macro.component';

describe('MarcacionesEmpMacroComponent', () => {
  let component: MarcacionesEmpMacroComponent;
  let fixture: ComponentFixture<MarcacionesEmpMacroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarcacionesEmpMacroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcacionesEmpMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
