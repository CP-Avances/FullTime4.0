import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaMacroComponent } from './asistencia-macro.component';

describe('AsistenciaMacroComponent', () => {
  let component: AsistenciaMacroComponent;
  let fixture: ComponentFixture<AsistenciaMacroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsistenciaMacroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsistenciaMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
