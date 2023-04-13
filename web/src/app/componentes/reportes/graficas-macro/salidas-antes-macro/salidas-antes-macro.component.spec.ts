import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalidasAntesMacroComponent } from './salidas-antes-macro.component';

describe('SalidasAntesMacroComponent', () => {
  let component: SalidasAntesMacroComponent;
  let fixture: ComponentFixture<SalidasAntesMacroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalidasAntesMacroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalidasAntesMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
