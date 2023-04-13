import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlimentosGeneralComponent } from './alimentos-general.component';

describe('AlimentosGeneralComponent', () => {
  let component: AlimentosGeneralComponent;
  let fixture: ComponentFixture<AlimentosGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlimentosGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlimentosGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
