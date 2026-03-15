import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesFormations } from './mes-formations';

describe('MesFormations', () => {
  let component: MesFormations;
  let fixture: ComponentFixture<MesFormations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesFormations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesFormations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
