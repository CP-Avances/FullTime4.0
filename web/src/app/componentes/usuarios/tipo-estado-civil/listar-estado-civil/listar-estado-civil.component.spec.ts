import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarEstadoCivilComponent } from './listar-estado-civil.component';

describe('ListarEstadoCivilComponent', () => {
  let component: ListarEstadoCivilComponent;
  let fixture: ComponentFixture<ListarEstadoCivilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarEstadoCivilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarEstadoCivilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
