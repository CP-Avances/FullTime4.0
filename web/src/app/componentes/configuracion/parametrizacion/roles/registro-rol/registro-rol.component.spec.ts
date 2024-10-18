import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroRolComponent } from './registro-rol.component';

describe('RegistroRolComponent', () => {
  let component: RegistroRolComponent;
  let fixture: ComponentFixture<RegistroRolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroRolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroRolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
