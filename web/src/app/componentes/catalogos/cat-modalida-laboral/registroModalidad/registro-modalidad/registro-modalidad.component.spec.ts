import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroModalidadComponent } from './registro-modalidad.component';

describe('RegistroModalidadComponent', () => {
  let component: RegistroModalidadComponent;
  let fixture: ComponentFixture<RegistroModalidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroModalidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroModalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
