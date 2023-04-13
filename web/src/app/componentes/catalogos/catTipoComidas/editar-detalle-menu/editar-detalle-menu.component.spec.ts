import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDetalleMenuComponent } from './editar-detalle-menu.component';

describe('EditarDetalleMenuComponent', () => {
  let component: EditarDetalleMenuComponent;
  let fixture: ComponentFixture<EditarDetalleMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarDetalleMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarDetalleMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
