import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCatHorarioComponent } from './detalle-cat-horario.component';

describe('DetalleCatHorarioComponent', () => {
  let component: DetalleCatHorarioComponent;
  let fixture: ComponentFixture<DetalleCatHorarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleCatHorarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleCatHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
