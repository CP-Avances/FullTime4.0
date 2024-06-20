import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVacunaComponent } from './editar-vacuna.component';

describe('EditarVacunaComponent', () => {
  let component: EditarVacunaComponent;
  let fixture: ComponentFixture<EditarVacunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarVacunaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarVacunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
