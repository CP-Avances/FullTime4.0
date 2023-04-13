import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEnroladosComponent } from './editar-enrolados.component';

describe('EditarEnroladosComponent', () => {
  let component: EditarEnroladosComponent;
  let fixture: ComponentFixture<EditarEnroladosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarEnroladosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarEnroladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
