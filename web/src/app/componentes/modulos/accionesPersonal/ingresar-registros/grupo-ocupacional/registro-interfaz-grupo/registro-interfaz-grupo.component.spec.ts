import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInterfazGrupoComponent } from './registro-interfaz-grupo.component';

describe('RegistroInterfazGrupoComponent', () => {
  let component: RegistroInterfazGrupoComponent;
  let fixture: ComponentFixture<RegistroInterfazGrupoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroInterfazGrupoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInterfazGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
