import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnroladoRelojComponent } from './enrolado-reloj.component';

describe('EnroladoRelojComponent', () => {
  let component: EnroladoRelojComponent;
  let fixture: ComponentFixture<EnroladoRelojComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnroladoRelojComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnroladoRelojComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
