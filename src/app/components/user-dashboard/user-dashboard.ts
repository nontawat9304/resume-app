import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth';
import { ResumeService } from '../../services/resume';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PdfService, ThemeSettings } from '../../services/pdf.service';
import { ThemeDesignerComponent } from '../theme-designer/theme-designer';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ReactiveFormsModule, ThemeDesignerComponent, LocalizedDatePipe],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})
export class UserDashboardComponent implements OnInit {
  userName = '';

  resumes: any[] = [];
  mainFeed: any[] = [];
  showModal = false;
  showDesigner = false; // Designer State
  currentDesignerPostId: string | null = null;

  // Edit State
  editingResumeId: string | null = null;
  editingTrainingId: string | null = null;

  trainingForm: FormGroup;
  tempImage: string | null = null;

  constructor(
    public auth: AuthService,
    private resumeService: ResumeService,
    private fb: FormBuilder,
    private router: Router,
    private pdfService: PdfService,
    private cd: ChangeDetectorRef
  ) {
    this.trainingForm = this.fb.group({
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
      issuer: ['', Validators.required],
      date: ['', Validators.required],
      image: ['']
    });
  }

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.userName = user.name;
      this.loadResumes(user.id);
    }
  }

  loadResumes(userId: string) {
    this.resumeService.getResumesByUser(userId).subscribe(res => {
      // Sort resumes by updated date descending
      this.resumes = res.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      // Migration: Ensure all training items have IDs for editing
      this.resumes.forEach(r => {
        if (r.training) {
          r.training.forEach((t: any) => {
            if (!t.id) t.id = crypto.randomUUID();
          });
        }
      });

      this.generateFeed();
    });
  }

  generateFeed() {
    const resumeItems: any[] = [];
    const trainingItems: any[] = [];

    this.resumes.forEach(resume => {
      // 1. Resume Items
      resumeItems.push({
        type: 'resume',
        id: resume.id,
        title: resume.title,
        personalInfo: resume.personalInfo,
        skills: resume.skills,
        experience: resume.experience,
        updatedAt: resume.updatedAt,
        user: this.userName
      });

      // 2. Training Items
      if (resume.training && resume.training.length > 0) {
        resume.training.forEach((t: any) => {
          trainingItems.push({
            type: 'training',
            ...t,
            resumeId: resume.id, // Critical for Edit/Delete
            resumeTitle: resume.title,
            updatedAt: t.updatedAt || resume.updatedAt,
            user: this.userName,
            showDetails: false
          });
        });
      }
    });

    // Sort Resumes (Newest First)
    resumeItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Sort Training (Newest First by Date or UpdatedAt)
    // Preference: t.date (User input) > t.startDate > t.updatedAt
    trainingItems.sort((a, b) => {
      const dateA = new Date(a.date || a.startDate || a.updatedAt).getTime();
      const dateB = new Date(b.date || b.startDate || b.updatedAt).getTime();
      return dateB - dateA;
    });

    // Combine: Resumes ALWAYS on top, followed by Training
    this.mainFeed = [...resumeItems, ...trainingItems];
  }

  openModal() {
    this.editingResumeId = null;
    this.editingTrainingId = null;
    this.showModal = true;
    this.trainingForm.reset();
    this.tempImage = null;
    // Set default date to today
    this.trainingForm.patchValue({ date: new Date().toISOString().substring(0, 10) });
  }

  closeModal() {
    this.showModal = false;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.tempImage = e.target.result;
        this.trainingForm.patchValue({ image: this.tempImage });
        this.cd.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onProfilePicChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const currentUser = this.auth.currentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: e.target.result };
          this.auth.updateUser(updatedUser);
          this.cd.detectChanges();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  editTraining(post: any) {
    this.editingResumeId = post.resumeId;
    this.editingTrainingId = post.id;

    // keys matching form
    this.trainingForm.patchValue({
      name: post.name,
      courseCode: post.courseCode,
      skillCategory: post.skillCategory,
      instructor: post.instructor,
      learningObjective: post.learningObjective,
      startDate: post.startDate,
      endDate: post.endDate,
      deliveryMode: post.deliveryMode,
      trainingLevel: post.trainingLevel,
      skillType: post.skillType,
      prerequisites: post.prerequisites,
      trainingCost: post.trainingCost,
      note: post.note,
      issuer: post.issuer,
      date: post.date || new Date().toISOString().substring(0, 10),
      image: post.image
    });
    this.tempImage = post.image || null;
    this.showModal = true;
  }

  deleteTraining(post: any) {
    if (!confirm('Are you sure you want to delete this training?')) return;

    const targetResume = this.resumes.find(r => r.id === post.resumeId);
    if (targetResume && targetResume.training) {
      targetResume.training = targetResume.training.filter((t: any) => t.id !== post.id);
      targetResume.updatedAt = new Date(); // Touch update

      this.resumeService.saveResume(targetResume).subscribe(() => {
        this.loadResumes(this.auth.currentUser()!.id);
        alert('Training deleted.');
      });
    }
  }

  removeImage() {
    this.tempImage = null;
    this.trainingForm.patchValue({ image: '' });
  }

  saveTraining() {
    if (this.trainingForm.valid) {
      const formValue = this.trainingForm.value;

      // Determine Resume
      let targetResume: any;

      if (this.editingResumeId) {
        targetResume = this.resumes.find(r => r.id === this.editingResumeId);
      } else {
        targetResume = this.resumes.length > 0 ? this.resumes[0] : null;
      }

      if (!targetResume) {
        // Create a blank resume if none exists
        const user = this.auth.currentUser();
        if (!user) return;
        targetResume = {
          id: crypto.randomUUID(),
          userId: user.id,
          title: 'My Resume',
          personalInfo: { fullName: user.name, email: user.email, phone: '', location: '', summary: '' },
          experience: [],
          training: [],
          skills: [],
          updatedAt: new Date()
        };
        this.resumes.push(targetResume);
      }

      if (!targetResume.training) {
        targetResume.training = [];
      }

      if (this.editingTrainingId) {
        // UPDATE
        const index = targetResume.training.findIndex((t: any) => t.id === this.editingTrainingId);
        if (index !== -1) {
          targetResume.training[index] = {
            ...targetResume.training[index],
            ...formValue
          };
        }
      } else {
        // CREATE
        const newTraining = {
          ...formValue,
          id: crypto.randomUUID()
        };
        targetResume.training.push(newTraining);
      }

      targetResume.updatedAt = new Date();

      // Save
      this.resumeService.saveResume(targetResume).subscribe(() => {
        alert(this.editingTrainingId ? 'Training updated!' : 'Training added!');
        this.closeModal();
        // Force reload from DB to ensure sync
        const user = this.auth.currentUser();
        if (user) this.loadResumes(user.id);
      });
    }
  }

  logout() {
    this.auth.logout();
  }

  deleteResume(id: string) {
    if (confirm('Are you sure you want to delete this resume? This cannot be undone.')) {
      this.resumeService.deleteResume(id).subscribe(() => {
        // Remove from local list
        this.resumes = this.resumes.filter(r => r.id !== id);
        this.generateFeed();
        alert('Resume deleted successfully.');
      });
    }
  }

  exportPdf(postId: string, theme: string) {
    if (theme === 'custom') {
      this.currentDesignerPostId = postId;
      this.showDesigner = true;
      return;
    }
    const elementId = 'resume-pdf-' + postId;
    this.pdfService.exportToPdf(elementId, `resume-${theme}`, `theme-${theme}`);
  }

  onThemeApplied(settings: ThemeSettings) {
    if (this.currentDesignerPostId) {
      const elementId = 'resume-pdf-' + this.currentDesignerPostId;
      this.pdfService.exportToPdf(elementId, `resume-custom`, 'custom', settings);
      this.showDesigner = false;
      this.currentDesignerPostId = null;
    }
  }
}
