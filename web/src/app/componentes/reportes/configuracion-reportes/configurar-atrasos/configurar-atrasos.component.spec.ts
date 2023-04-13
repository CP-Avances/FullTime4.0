import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarAtrasosComponent } from './configurar-atrasos.component';

describe('ConfigurarAtrasosComponent', () => {
  let component: ConfigurarAtrasosComponent;
  let fixture: ComponentFixture<ConfigurarAtrasosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurarAtrasosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurarAtrasosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
