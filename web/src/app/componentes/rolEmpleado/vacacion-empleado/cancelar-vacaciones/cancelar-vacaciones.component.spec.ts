import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarVacacionesComponent } from './cancelar-vacaciones.component';

describe('CancelarVacacionesComponent', () => {
  let component: CancelarVacacionesComponent;
  let fixture: ComponentFixture<CancelarVacacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelarVacacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelarVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
