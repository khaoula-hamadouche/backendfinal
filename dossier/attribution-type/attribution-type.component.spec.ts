import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributionTypeComponent } from './attribution-type.component';

describe('AttributionTypeComponent', () => {
  let component: AttributionTypeComponent;
  let fixture: ComponentFixture<AttributionTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributionTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttributionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
