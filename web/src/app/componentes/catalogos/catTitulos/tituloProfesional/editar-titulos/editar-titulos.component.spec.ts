import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTitulosComponent } from './editar-titulos.component';

describe('EditarTitulosComponent', () => {
  let component: EditarTitulosComponent;
  let fixture: ComponentFixture<EditarTitulosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarTitulosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
