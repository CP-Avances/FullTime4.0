import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarFeriadosComponent } from './listar-feriados.component';

describe('ListarFeriadosComponent', () => {
  let component: ListarFeriadosComponent;
  let fixture: ComponentFixture<ListarFeriadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarFeriadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarFeriadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
