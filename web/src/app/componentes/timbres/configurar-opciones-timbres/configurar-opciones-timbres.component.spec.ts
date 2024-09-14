import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarOpcionesTimbresComponent } from './configurar-opciones-timbres.component';

describe('ConfigurarOpcionesTimbresComponent', () => {
  let component: ConfigurarOpcionesTimbresComponent;
  let fixture: ComponentFixture<ConfigurarOpcionesTimbresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurarOpcionesTimbresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurarOpcionesTimbresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
