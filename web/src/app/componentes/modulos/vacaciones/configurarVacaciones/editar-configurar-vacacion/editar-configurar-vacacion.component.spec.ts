import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarConfigurarVacacionComponent } from './editar-configurar-vacacion.component';

describe('EditarConfigurarVacacionComponent', () => {
  let component: EditarConfigurarVacacionComponent;
  let fixture: ComponentFixture<EditarConfigurarVacacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarConfigurarVacacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarConfigurarVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
