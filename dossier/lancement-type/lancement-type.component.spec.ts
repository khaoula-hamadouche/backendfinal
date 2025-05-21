import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LancementTypeComponent } from './lancement-type.component';

describe('LancementTypeComponent', () => {
  let component: LancementTypeComponent;
  let fixture: ComponentFixture<LancementTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LancementTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LancementTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
