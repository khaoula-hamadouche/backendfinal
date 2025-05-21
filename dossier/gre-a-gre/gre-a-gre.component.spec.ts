import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreAGreComponent } from './gre-a-gre.component';

describe('GreAGreComponent', () => {
  let component: GreAGreComponent;
  let fixture: ComponentFixture<GreAGreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreAGreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreAGreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
