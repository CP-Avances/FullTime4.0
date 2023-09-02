import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearParametroComponent } from './crear-parametro.component';

describe('CrearParametroComponent', () => {
  let component: CrearParametroComponent;
  let fixture: ComponentFixture<CrearParametroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearParametroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
