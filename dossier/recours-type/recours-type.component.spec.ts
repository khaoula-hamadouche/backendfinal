import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoursTypeComponent } from './recours-type.component';

describe('RecoursTypeComponent', () => {
  let component: RecoursTypeComponent;
  let fixture: ComponentFixture<RecoursTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoursTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoursTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
