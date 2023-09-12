import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarTimbreComponent } from './registrar-timbre.component';

describe('RegistrarTimbreComponent', () => {
  let component: RegistrarTimbreComponent;
  let fixture: ComponentFixture<RegistrarTimbreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarTimbreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarTimbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
