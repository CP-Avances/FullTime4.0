import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigAsistenciaComponent } from './config-asistencia.component';

describe('ConfigAsistenciaComponent', () => {
  let component: ConfigAsistenciaComponent;
  let fixture: ComponentFixture<ConfigAsistenciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigAsistenciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
