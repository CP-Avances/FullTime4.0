import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInterfazProcesoComponent } from './registro-interfaz-proceso.component';

describe('RegistroInterfazProcesoComponent', () => {
  let component: RegistroInterfazProcesoComponent;
  let fixture: ComponentFixture<RegistroInterfazProcesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroInterfazProcesoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInterfazProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
