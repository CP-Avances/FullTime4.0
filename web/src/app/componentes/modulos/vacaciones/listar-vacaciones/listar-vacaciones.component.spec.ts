import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarVacacionesComponent } from './listar-vacaciones.component';

describe('ListarVacacionesComponent', () => {
  let component: ListarVacacionesComponent;
  let fixture: ComponentFixture<ListarVacacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarVacacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
