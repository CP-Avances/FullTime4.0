import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarCodigoComponent } from './configurar-codigo.component';

describe('ConfigurarCodigoComponent', () => {
  let component: ConfigurarCodigoComponent;
  let fixture: ComponentFixture<ConfigurarCodigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurarCodigoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurarCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
