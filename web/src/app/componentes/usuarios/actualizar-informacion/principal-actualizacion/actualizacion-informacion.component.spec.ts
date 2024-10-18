import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizacionInformacionComponent } from './actualizacion-informacion.component';

describe('ActualizacionInformacionComponent', () => {
  let component: ActualizacionInformacionComponent;
  let fixture: ComponentFixture<ActualizacionInformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizacionInformacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualizacionInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
