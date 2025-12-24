import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Resume, ResumeService } from '../../services/resume';
import { AuthService } from '../../services/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-resume-editor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './resume-editor.html',
  styleUrl: './resume-editor.scss'
})
export class ResumeEditorComponent implements OnInit {
  resumeForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private resumeService: ResumeService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private pdfService: PdfService,
    private location: Location,
    private cd: ChangeDetectorRef
  ) {
    this.resumeForm = this.fb.group({
      id: [crypto.randomUUID()], // Auto-generate ID
      title: ['My Resume', Validators.required],
      personalInfo: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        location: [''],
        summary: ['']
      }),
      experience: this.fb.array([]),
      education: this.fb.array([]),
      training: this.fb.array([]),
      skills: [''],
      isPublished: [false]
    });
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadResume(id);
    } else {
      // New Resume: Default Name from Auth
      const user = this.auth.currentUser();
      if (user) {
        this.resumeForm.patchValue({
          personalInfo: {
            fullName: user.name,
            email: user.email
          }
        });
      }
    }
  }

  loadResume(id: string) {
    this.resumeService.getResumeById(id).subscribe(resume => {
      if (resume) {
        this.resumeForm.patchValue({
          id: resume.id,
          title: resume.title,
          personalInfo: resume.personalInfo,
          skills: resume.skills.join(', '),
        });

        this.patchArray('experience', resume.experience);
        this.patchArray('education', resume.education);
        this.patchArray('training', resume.training || []);
      }
    });
  }

  patchArray(controlName: string, data: any[]) {
    const array = this.resumeForm.get(controlName) as FormArray;
    array.clear();
    data.forEach(item => {
      if (controlName === 'experience') {
        const group = this.fb.group({
          title: [item.title, Validators.required],
          company: [item.company, Validators.required],
          startDate: [item.startDate],
          endDate: [item.endDate],
          currentlyWorking: [item.currentlyWorking],
          description: [item.description]
        });
        array.push(group);
      } else if (controlName === 'training') {
        const group = this.fb.group({
          name: [item.name, Validators.required],
          courseCode: [item.courseCode || ''],
          skillCategory: [item.skillCategory || ''],
          instructor: [item.instructor || ''],
          learningObjective: [item.learningObjective || ''],
          startDate: [item.startDate || ''],
          endDate: [item.endDate || ''],
          deliveryMode: [item.deliveryMode || 'online'],
          trainingLevel: [item.trainingLevel || 'beginner'],
          skillType: [item.skillType || 'Upskill'],
          prerequisites: [item.prerequisites || ''],
          trainingCost: [item.trainingCost || 0],
          note: [item.note || ''],
          issuer: [item.issuer, Validators.required],
          date: [item.date],
          image: [item.image]
        });
        array.push(group);
      }
    });
  }

  get experienceControls() {
    return (this.resumeForm.get('experience') as FormArray).controls as FormGroup[];
  }

  get trainingControls() {
    return (this.resumeForm.get('training') as FormArray).controls as FormGroup[];
  }

  addExperience() {
    const exp = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      currentlyWorking: [false],
      description: ['']
    });
    (this.resumeForm.get('experience') as FormArray).push(exp);
  }

  addTraining() {
    const train = this.fb.group({
      name: ['', Validators.required],
      courseCode: [''],
      skillCategory: [''],
      instructor: [''],
      learningObjective: [''],
      startDate: [''],
      endDate: [''],
      deliveryMode: ['online'],
      trainingLevel: ['beginner'],
      skillType: ['Upskill'],
      prerequisites: [''],
      trainingCost: [0],
      note: [''],
      issuer: ['', Validators.required], // Institute/Issuer
      date: [''],
      image: [''] // Base64
    });
    (this.resumeForm.get('training') as FormArray).push(train);
  }

  removeExperience(index: number) {
    (this.resumeForm.get('experience') as FormArray).removeAt(index);
  }

  removeTraining(index: number) {
    (this.resumeForm.get('training') as FormArray).removeAt(index);
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        const group = (this.resumeForm.get('training') as FormArray).at(index);
        group.patchValue({ image: base64 });
        this.cd.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    const group = (this.resumeForm.get('training') as FormArray).at(index);
    group.patchValue({ image: '' });
  }

  generateDescription(index: number) {
    const expGroup = (this.resumeForm.get('experience') as FormArray).at(index);
    const title = expGroup.get('title')?.value;
    if (title) {
      expGroup.patchValue({ description: `Draft generated for ${title}: Responsible for leading development... (AI Implementation pending)` });
    } else {
      alert('Please enter a Job Title first.');
    }
  }

  onSubmit() {
    if (this.resumeForm.valid) {
      this.isSubmitting = true;
      const formVal = this.resumeForm.value;
      const currentUser = this.auth.currentUser();

      if (currentUser) {
        const resume: Resume = {
          ...formVal,
          userId: currentUser.id,
          skills: typeof formVal.skills === 'string' ? formVal.skills.split(',').map((s: string) => s.trim()) : formVal.skills,
          updatedAt: new Date()
        };

        // SYNC PROFILE NAME
        if (formVal.personalInfo?.fullName && formVal.personalInfo.fullName !== currentUser.name) {
          const updatedUser = { ...currentUser, name: formVal.personalInfo.fullName };
          this.auth.updateUser(updatedUser);
        }

        this.resumeService.saveResume(resume).subscribe(() => {
          this.isSubmitting = false;
          alert('Resume saved successfully!');
          this.router.navigate(['/dashboard']);
        });
      }
    } else {
      console.warn('[ResumeEditor] Form invalid:', this.resumeForm.errors);
      // Log specific invalid controls
      Object.keys(this.resumeForm.controls).forEach(key => {
        const control = this.resumeForm.get(key);
        if (control?.invalid) {
          console.warn(`[ResumeEditor] Invalid Control: ${key}`, control.errors);
        }
      });
      alert('Please fill in all required fields marked with *');
      this.resumeForm.markAllAsTouched();
    }
  }

  exportPdf(theme: string) {
    const id = 'resume-editor-export';
    this.pdfService.exportToPdf(id, `my-resume-${theme}`, `theme-${theme}`);
  }

  goBack() {
    this.location.back();
  }
}
