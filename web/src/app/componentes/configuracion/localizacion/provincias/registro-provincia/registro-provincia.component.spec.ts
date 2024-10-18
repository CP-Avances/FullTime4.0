import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroProvinciaComponent } from './registro-provincia.component';

describe('RegistroProvinciaComponent', () => {
  let component: RegistroProvinciaComponent;
  let fixture: ComponentFixture<RegistroProvinciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroProvinciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroProvinciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
