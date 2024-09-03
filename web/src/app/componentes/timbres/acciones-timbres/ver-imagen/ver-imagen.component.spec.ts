import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerImagenComponent } from './ver-imagen.component';

describe('VerImagenComponent', () => {
  let component: VerImagenComponent;
  let fixture: ComponentFixture<VerImagenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerImagenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerImagenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
