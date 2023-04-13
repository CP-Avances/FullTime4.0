import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAutorizacionDepaComponent } from './registro-autorizacion-depa.component';

describe('RegistroAutorizacionDepaComponent', () => {
  let component: RegistroAutorizacionDepaComponent;
  let fixture: ComponentFixture<RegistroAutorizacionDepaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroAutorizacionDepaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAutorizacionDepaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
