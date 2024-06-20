import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionJefeComponent } from './informacion-jefe.component';

describe('InformacionJefeComponent', () => {
  let component: InformacionJefeComponent;
  let fixture: ComponentFixture<InformacionJefeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionJefeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionJefeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
