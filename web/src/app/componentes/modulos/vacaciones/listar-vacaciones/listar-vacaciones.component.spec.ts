import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarVacacionesComponent } from './listar-vacaciones.component';

describe('ListarVacacionesComponent', () => {
  let component: ListarVacacionesComponent;
  let fixture: ComponentFixture<ListarVacacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarVacacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
