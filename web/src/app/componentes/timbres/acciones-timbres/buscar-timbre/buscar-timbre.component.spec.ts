import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarTimbreComponent } from './buscar-timbre.component';

describe('BuscarTimbreComponent', () => {
  let component: BuscarTimbreComponent;
  let fixture: ComponentFixture<BuscarTimbreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarTimbreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarTimbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
