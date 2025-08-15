import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarVacacionMultipleComponent } from './configurar-vacacion-multiple.component';

describe('ConfigurarVacacionMultipleComponent', () => {
  let component: ConfigurarVacacionMultipleComponent;
  let fixture: ComponentFixture<ConfigurarVacacionMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigurarVacacionMultipleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurarVacacionMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
