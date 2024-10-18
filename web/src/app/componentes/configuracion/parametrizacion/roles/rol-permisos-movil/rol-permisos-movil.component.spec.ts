import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolPermisosMovilComponent } from './rol-permisos-movil.component';

describe('RolPermisosMovilComponent', () => {
  let component: RolPermisosMovilComponent;
  let fixture: ComponentFixture<RolPermisosMovilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolPermisosMovilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolPermisosMovilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
