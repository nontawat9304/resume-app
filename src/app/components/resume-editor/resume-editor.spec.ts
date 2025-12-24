import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeEditor } from './resume-editor';

describe('ResumeEditor', () => {
  let component: ResumeEditor;
  let fixture: ComponentFixture<ResumeEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
