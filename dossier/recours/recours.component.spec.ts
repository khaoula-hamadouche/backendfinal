import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoursComponent } from './recours.component';

describe('RecoursComponent', () => {
  let component: RecoursComponent;
  let fixture: ComponentFixture<RecoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
