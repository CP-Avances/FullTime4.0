import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroMultipleGrupoComponent } from './registro-multiple-grupo.component';

describe('RegistroMultipleGrupoComponent', () => {
  let component: RegistroMultipleGrupoComponent;
  let fixture: ComponentFixture<RegistroMultipleGrupoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroMultipleGrupoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroMultipleGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
