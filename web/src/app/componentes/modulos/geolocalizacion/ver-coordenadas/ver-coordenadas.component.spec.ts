import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerCoordenadasComponent } from './ver-coordenadas.component';

describe('VerCoordenadasComponent', () => {
  let component: VerCoordenadasComponent;
  let fixture: ComponentFixture<VerCoordenadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerCoordenadasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerCoordenadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
