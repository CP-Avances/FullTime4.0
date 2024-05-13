import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDiscapacidadComponent } from './editar-discapacidad.component';

describe('EditarModalidadComponent', () => {
  let component: EditarDiscapacidadComponent;
  let fixture: ComponentFixture<EditarDiscapacidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarDiscapacidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarDiscapacidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
