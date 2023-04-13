import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerCoordenadasComponent } from './ver-coordenadas.component';

describe('VerCoordenadasComponent', () => {
  let component: VerCoordenadasComponent;
  let fixture: ComponentFixture<VerCoordenadasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerCoordenadasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerCoordenadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
