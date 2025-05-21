import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvenantTypeComponent } from './avenant-type.component';

describe('AvenantTypeComponent', () => {
  let component: AvenantTypeComponent;
  let fixture: ComponentFixture<AvenantTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvenantTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvenantTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
