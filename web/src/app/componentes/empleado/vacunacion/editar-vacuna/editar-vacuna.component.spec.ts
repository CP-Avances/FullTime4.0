import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVacunaComponent } from './editar-vacuna.component';

describe('EditarVacunaComponent', () => {
  let component: EditarVacunaComponent;
  let fixture: ComponentFixture<EditarVacunaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarVacunaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarVacunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
