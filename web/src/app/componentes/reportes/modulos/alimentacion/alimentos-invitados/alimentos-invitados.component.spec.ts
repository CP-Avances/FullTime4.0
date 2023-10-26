import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlimentosInvitadosComponent } from './alimentos-invitados.component';

describe('AlimentosInvitadosComponent', () => {
  let component: AlimentosInvitadosComponent;
  let fixture: ComponentFixture<AlimentosInvitadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlimentosInvitadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlimentosInvitadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
