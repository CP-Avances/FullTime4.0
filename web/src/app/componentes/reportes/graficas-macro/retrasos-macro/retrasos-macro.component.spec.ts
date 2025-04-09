import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrasosMacroComponent } from './retrasos-macro.component';

describe('RetrasosMacroComponent', () => {
  let component: RetrasosMacroComponent;
  let fixture: ComponentFixture<RetrasosMacroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrasosMacroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetrasosMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
