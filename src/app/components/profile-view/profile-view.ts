import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Resume, ResumeService } from '../../services/resume';
import { AuthService } from '../../services/auth';
import { PdfService, ThemeSettings } from '../../services/pdf.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ThemeDesignerComponent } from '../theme-designer/theme-designer';

import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, TranslateModule, ThemeDesignerComponent, LocalizedDatePipe],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.scss'
})
export class ProfileViewComponent implements OnInit {
  resume: Resume | null | undefined;
  id: string | null = null;
  userAvatar: string | undefined;
  showDesigner = false;

  constructor(
    private route: ActivatedRoute,
    private resumeService: ResumeService,
    public auth: AuthService,
    private pdfService: PdfService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.resumeService.getResumeById(this.id).pipe(
        catchError(err => {
          console.error('Profile View: Error loading resume', err);
          return of(null);
        })
      ).subscribe(res => {

        if (!res) {
          console.warn('Profile View: Resume not found or permission denied');
        }
        this.resume = res;

        // Initialize UI state
        if (this.resume && this.resume.training) {
          this.resume.training.forEach(t => t.showDetails = false);
        }

        if (res) {
          // Fetch Owner Avatar (safely)
          this.auth.getAllUsers().pipe(
            catchError(err => {
              console.warn('Profile View: Could not load avatar (likely permission)', err);
              return of([]);
            })
          ).subscribe((users: any[]) => {
            const owner = users.find(u => u.id === res.userId);
            this.userAvatar = owner?.avatar;
            this.cd.detectChanges(); // Update for Avatar
          });
        }

        this.cd.detectChanges(); // FORCE UI UPDATE for Resume
      });
    }
  }

  get isOwner(): boolean {
    const currentUser = this.auth.currentUser();
    return !!(this.resume && currentUser && this.resume.userId === currentUser.id);
  }

  exportPdf(theme: string) {
    if (theme === 'custom') {
      this.showDesigner = true;
      return;
    }
    if (this.resume && this.resume.personalInfo) {
      this.pdfService.exportToPdf('profile-pdf-content', `profile-${this.resume.personalInfo.fullName}`, `theme-${theme}`);
    }
  }

  onThemeApplied(settings: ThemeSettings) {
    if (this.resume) {
      this.pdfService.exportToPdf('profile-pdf-content', `profile-custom`, 'custom', settings);
      this.showDesigner = false;
    }
  }
}
