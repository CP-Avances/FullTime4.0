import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrupoOcupacionalComponent } from './grupo-ocupacional.component';

describe('GrupoOcupacionalComponent', () => {
  let component: GrupoOcupacionalComponent;
  let fixture: ComponentFixture<GrupoOcupacionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrupoOcupacionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrupoOcupacionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
