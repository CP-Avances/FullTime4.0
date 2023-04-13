import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTituloComponent } from './editar-titulo.component';

describe('EditarTituloComponent', () => {
  let component: EditarTituloComponent;
  let fixture: ComponentFixture<EditarTituloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarTituloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarTituloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
