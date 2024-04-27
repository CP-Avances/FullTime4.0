import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarModalidadComponent } from './editar-modalidad.component';

describe('EditarModalidadComponent', () => {
  let component: EditarModalidadComponent;
  let fixture: ComponentFixture<EditarModalidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarModalidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarModalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
