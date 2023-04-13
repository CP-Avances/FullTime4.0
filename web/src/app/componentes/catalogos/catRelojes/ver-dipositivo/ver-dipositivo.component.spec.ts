import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDipositivoComponent } from './ver-dipositivo.component';

describe('VerDipositivoComponent', () => {
  let component: VerDipositivoComponent;
  let fixture: ComponentFixture<VerDipositivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerDipositivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerDipositivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
