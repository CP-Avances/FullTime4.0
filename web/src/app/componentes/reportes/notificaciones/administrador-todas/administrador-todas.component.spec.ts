import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorTodasComponent } from './administrador-todas.component';

describe('AdministradorTodasComponent', () => {
  let component: AdministradorTodasComponent;
  let fixture: ComponentFixture<AdministradorTodasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministradorTodasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministradorTodasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
