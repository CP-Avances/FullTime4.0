import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPlanificacionesComponent } from './lista-planificaciones.component';

describe('ListaPlanificacionesComponent', () => {
  let component: ListaPlanificacionesComponent;
  let fixture: ComponentFixture<ListaPlanificacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaPlanificacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPlanificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
