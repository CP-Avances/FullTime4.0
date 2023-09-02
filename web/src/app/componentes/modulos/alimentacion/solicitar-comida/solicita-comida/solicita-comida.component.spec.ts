import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitaComidaComponent } from './solicita-comida.component';

describe('SolicitaComidaComponent', () => {
  let component: SolicitaComidaComponent;
  let fixture: ComponentFixture<SolicitaComidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitaComidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitaComidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
