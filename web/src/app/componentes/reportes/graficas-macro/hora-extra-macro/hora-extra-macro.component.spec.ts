import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoraExtraMacroComponent } from './hora-extra-macro.component';

describe('HoraExtraMacroComponent', () => {
  let component: HoraExtraMacroComponent;
  let fixture: ComponentFixture<HoraExtraMacroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoraExtraMacroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoraExtraMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
