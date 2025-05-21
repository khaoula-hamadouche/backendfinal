import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierFilesComponent } from './dossier-files.component';

describe('DossierFilesComponent', () => {
  let component: DossierFilesComponent;
  let fixture: ComponentFixture<DossierFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
