import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionNovedadesComponent } from './informacion-novedades.component';

describe('InformacionNovedadesComponent', () => {
  let component: InformacionNovedadesComponent;
  let fixture: ComponentFixture<InformacionNovedadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacionNovedadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionNovedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
