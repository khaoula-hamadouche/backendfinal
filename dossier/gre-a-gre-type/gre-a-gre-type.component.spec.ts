import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreAGreTypeComponent } from './gre-a-gre-type.component';

describe('GreAGreTypeComponent', () => {
  let component: GreAGreTypeComponent;
  let fixture: ComponentFixture<GreAGreTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreAGreTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreAGreTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
