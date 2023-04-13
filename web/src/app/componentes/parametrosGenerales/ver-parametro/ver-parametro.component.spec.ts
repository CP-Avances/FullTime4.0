import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerParametroComponent } from './ver-parametro.component';

describe('VerParametroComponent', () => {
  let component: VerParametroComponent;
  let fixture: ComponentFixture<VerParametroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerParametroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
