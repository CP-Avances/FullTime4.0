import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarConfigurarVacacionComponent } from './listar-configurar-vacacion.component';

describe('ListarConfigurarVacacionComponent', () => {
  let component: ListarConfigurarVacacionComponent;
  let fixture: ComponentFixture<ListarConfigurarVacacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarConfigurarVacacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarConfigurarVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
