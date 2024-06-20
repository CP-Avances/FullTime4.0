import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarHorasExtrasComponent } from './editar-horas-extras.component';

describe('EditarHorasExtrasComponent', () => {
  let component: EditarHorasExtrasComponent;
  let fixture: ComponentFixture<EditarHorasExtrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarHorasExtrasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarHorasExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
