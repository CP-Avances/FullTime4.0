import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarFeriadosComponent } from './listar-feriados.component';

describe('ListarFeriadosComponent', () => {
  let component: ListarFeriadosComponent;
  let fixture: ComponentFixture<ListarFeriadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarFeriadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarFeriadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
