import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVacunasComponent } from './editar-vacuna.component';

describe('EditarVacunasComponent', () => {
  let component: EditarVacunasComponent;
  let fixture: ComponentFixture<EditarVacunasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarVacunasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarVacunasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
