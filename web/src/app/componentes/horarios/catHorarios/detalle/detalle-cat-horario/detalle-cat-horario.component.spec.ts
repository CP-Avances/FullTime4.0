import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCatHorarioComponent } from './detalle-cat-horario.component';

describe('DetalleCatHorarioComponent', () => {
  let component: DetalleCatHorarioComponent;
  let fixture: ComponentFixture<DetalleCatHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleCatHorarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCatHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
