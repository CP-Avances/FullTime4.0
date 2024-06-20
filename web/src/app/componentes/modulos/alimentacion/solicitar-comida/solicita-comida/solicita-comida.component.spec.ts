import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitaComidaComponent } from './solicita-comida.component';

describe('SolicitaComidaComponent', () => {
  let component: SolicitaComidaComponent;
  let fixture: ComponentFixture<SolicitaComidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitaComidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitaComidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
