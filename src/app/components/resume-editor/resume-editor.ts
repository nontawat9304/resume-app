import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Resume, ResumeService } from '../../services/resume';
import { AuthService } from '../../services/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PdfService } from '../../services/pdf.service';
import { AiService } from '../../services/ai';

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
    private cd: ChangeDetectorRef,
    private aiService: AiService // Injection
  ) {
    this.resumeForm = this.fb.group({
      id: [crypto.randomUUID()],
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

  // ... (ngOnInit and loadResume methods remain the same) ...

  // Helper State
  isGenerating = false;

  async generateSummaryAI() {
    const jobTitle = this.resumeForm.get('title')?.value;
    const skills = this.resumeForm.get('skills')?.value || '';

    if (!jobTitle) {
      alert('กรุณาระบุ "ชื่อเรซูเม่" หรือตำแหน่งงานเป้าหมายก่อนครับ');
      return;
    }

    this.isGenerating = true;
    const skillList = typeof skills === 'string' ? skills.split(',') : (skills || []);

    this.aiService.generateSummary(jobTitle, skillList).subscribe(summary => {
      this.isGenerating = false;
      this.resumeForm.patchValue({
        personalInfo: { summary: summary }
      });
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
      } else if (controlName === 'education') {
        const group = this.fb.group({
          school: [item.school, Validators.required],
          degree: [item.degree, Validators.required],
          fieldOfStudy: [item.fieldOfStudy || ''],
          startDate: [item.startDate || ''],
          graduationDate: [item.graduationDate || item.endDate, Validators.required],
          description: [item.description || '']
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

  get educationControls() {
    return (this.resumeForm.get('education') as FormArray).controls as FormGroup[];
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

  addEducation() {
    const edu = this.fb.group({
      school: ['', Validators.required],
      degree: ['', Validators.required],
      fieldOfStudy: [''],
      startDate: [''],
      graduationDate: ['', Validators.required], // endDate
      description: ['']
    });
    (this.resumeForm.get('education') as FormArray).push(edu);
  }

  removeEducation(index: number) {
    (this.resumeForm.get('education') as FormArray).removeAt(index);
  }

  removeTraining(index: number) {
    (this.resumeForm.get('training') as FormArray).removeAt(index);
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        alert('รูปภาพมีขนาดใหญ่เกินไป! กรุณาเลือกรูปขนาดไม่เกิน 5MB ครับ');
        return;
      }
      this.compressImage(file, 800, 800).then(compressed => {
        const group = (this.resumeForm.get('training') as FormArray).at(index);
        group.patchValue({ image: compressed });
        this.cd.detectChanges();
      });
    }
  }

  // Helper: Client-side Image Compression (Duplicated from Dashboard for stability)
  compressImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  }

  removeImage(index: number) {
    const group = (this.resumeForm.get('training') as FormArray).at(index);
    group.patchValue({ image: '' });
  }



  onSubmit() {
    console.log('onSubmit called'); // Debug
    if (this.resumeForm.valid) {
      console.log('Form valid, submitting...'); // Debug
      this.isSubmitting = true;
      const formVal = this.resumeForm.value;
      const currentUser = this.auth.currentUser();
      console.log('Current User:', currentUser); // Debug

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

        this.resumeService.saveResume(resume).subscribe({
          next: () => {
            console.log('Save success'); // Debug
            this.isSubmitting = false;
            alert(this.route.snapshot.paramMap.get('id') ? 'บันทึกการแก้ไขเรียบร้อยแล้วครับ! 💾' : 'สร้างเรซูเม่ใหม่เรียบร้อยแล้วครับ! ไปดูที่หน้าแดชบอร์ดกันเลย 🚀');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Save error', err); // Debug
            this.isSubmitting = false;
            console.error('Save failed', err);
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + (err.message || 'กรุณาลองใหม่อีกครั้งครับ'));
          }
        });
      } else {
        console.warn('No user logged in'); // Debug
        this.isSubmitting = false;
        alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่ครับ');
        this.router.navigate(['/login']);
      }
    } else {
      console.warn('[ResumeEditor] Form invalid:', this.resumeForm.errors);
      console.log('Form Values:', this.resumeForm.value); // Debug
      alert('กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบถ้วนนะครับ');
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
