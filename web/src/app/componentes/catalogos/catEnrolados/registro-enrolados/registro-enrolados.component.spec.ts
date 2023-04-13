import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEnroladosComponent } from './registro-enrolados.component';

describe('RegistroEnroladosComponent', () => {
  let component: RegistroEnroladosComponent;
  let fixture: ComponentFixture<RegistroEnroladosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroEnroladosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroEnroladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
