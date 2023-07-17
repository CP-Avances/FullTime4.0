import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFeriadosComponent } from './editar-feriados.component';

describe('EditarFeriadosComponent', () => {
  let component: EditarFeriadosComponent;
  let fixture: ComponentFixture<EditarFeriadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarFeriadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarFeriadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
