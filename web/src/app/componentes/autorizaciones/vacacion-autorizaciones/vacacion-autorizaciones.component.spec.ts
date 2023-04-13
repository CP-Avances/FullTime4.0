import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VacacionAutorizacionesComponent } from './vacacion-autorizaciones.component';

describe('VacacionAutorizacionesComponent', () => {
  let component: VacacionAutorizacionesComponent;
  let fixture: ComponentFixture<VacacionAutorizacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VacacionAutorizacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VacacionAutorizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
