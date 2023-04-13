import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InasistenciaMacroComponent } from './inasistencia-macro.component';

describe('InasistenciaMacroComponent', () => {
  let component: InasistenciaMacroComponent;
  let fixture: ComponentFixture<InasistenciaMacroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InasistenciaMacroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InasistenciaMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
