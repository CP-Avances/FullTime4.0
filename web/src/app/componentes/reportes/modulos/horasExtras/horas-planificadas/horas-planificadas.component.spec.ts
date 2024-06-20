import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasPlanificadasComponent } from './horas-planificadas.component';

describe('HorasPlanificadasComponent', () => {
  let component: HorasPlanificadasComponent;
  let fixture: ComponentFixture<HorasPlanificadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorasPlanificadasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasPlanificadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
