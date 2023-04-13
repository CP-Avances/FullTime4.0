import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalEnroladosComponent } from './principal-enrolados.component';

describe('PrincipalEnroladosComponent', () => {
  let component: PrincipalEnroladosComponent;
  let fixture: ComponentFixture<PrincipalEnroladosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrincipalEnroladosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalEnroladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
