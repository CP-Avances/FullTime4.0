import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarCodigoComponent } from './configurar-codigo.component';

describe('ConfigurarCodigoComponent', () => {
  let component: ConfigurarCodigoComponent;
  let fixture: ComponentFixture<ConfigurarCodigoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurarCodigoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurarCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
