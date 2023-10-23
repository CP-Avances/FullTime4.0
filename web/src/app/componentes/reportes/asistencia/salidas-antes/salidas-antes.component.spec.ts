import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalidasAntesComponent } from './salidas-antes.component';

describe('SalidasAntesComponent', () => {
  let component: SalidasAntesComponent;
  let fixture: ComponentFixture<SalidasAntesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalidasAntesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalidasAntesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
