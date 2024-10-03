import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpcionesTimbreWebComponent } from './opciones-timbre-web.component';

describe('OpcionesTimbreWebComponent', () => {
  let component: OpcionesTimbreWebComponent;
  let fixture: ComponentFixture<OpcionesTimbreWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpcionesTimbreWebComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpcionesTimbreWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
