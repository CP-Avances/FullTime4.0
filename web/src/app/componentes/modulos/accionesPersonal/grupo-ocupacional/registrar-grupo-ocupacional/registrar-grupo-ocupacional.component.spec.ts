import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarGrupoOcupacionalComponent } from './registrar-grupo-ocupacional.component';

describe('RegistrarGrupoOcupacionalComponent', () => {
  let component: RegistrarGrupoOcupacionalComponent;
  let fixture: ComponentFixture<RegistrarGrupoOcupacionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarGrupoOcupacionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarGrupoOcupacionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
