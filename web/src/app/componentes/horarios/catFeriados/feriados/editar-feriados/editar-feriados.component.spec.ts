import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFeriadosComponent } from './editar-feriados.component';

describe('EditarFeriadosComponent', () => {
  let component: EditarFeriadosComponent;
  let fixture: ComponentFixture<EditarFeriadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarFeriadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarFeriadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
