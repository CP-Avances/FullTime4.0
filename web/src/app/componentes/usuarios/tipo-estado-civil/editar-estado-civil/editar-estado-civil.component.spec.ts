import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEstadoCivilComponent } from './editar-estado-civil.component';

describe('EditarEstadoCivilComponent', () => {
  let component: EditarEstadoCivilComponent;
  let fixture: ComponentFixture<EditarEstadoCivilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarEstadoCivilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEstadoCivilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
