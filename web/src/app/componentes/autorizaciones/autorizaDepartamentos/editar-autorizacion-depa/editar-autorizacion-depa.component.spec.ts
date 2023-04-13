import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAutorizacionDepaComponent } from './editar-autorizacion-depa.component';

describe('EditarAutorizacionDepaComponent', () => {
  let component: EditarAutorizacionDepaComponent;
  let fixture: ComponentFixture<EditarAutorizacionDepaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarAutorizacionDepaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarAutorizacionDepaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
