import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerOpcionesTimbreWebComponent } from './ver-opciones-timbre-web.component';

describe('VerOpcionesTimbreWebComponent', () => {
  let component: VerOpcionesTimbreWebComponent;
  let fixture: ComponentFixture<VerOpcionesTimbreWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerOpcionesTimbreWebComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerOpcionesTimbreWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
