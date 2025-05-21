import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvenantComponent } from './avenant.component';

describe('AvenantComponent', () => {
  let component: AvenantComponent;
  let fixture: ComponentFixture<AvenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvenantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
