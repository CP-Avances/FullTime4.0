import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComunicadosComponent } from './comunicados.component';

describe('ComunicadosComponent', () => {
  let component: ComunicadosComponent;
  let fixture: ComponentFixture<ComunicadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComunicadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComunicadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
