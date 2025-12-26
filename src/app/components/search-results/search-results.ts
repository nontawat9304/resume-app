import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { ResumeService, Resume } from '../../services/resume';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { PdfService } from '../../services/pdf.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss'
})
export class SearchResultsComponent implements OnInit {
  results: any[] = [];
  query: string = '';

  constructor(
    private route: ActivatedRoute,
    private resumeService: ResumeService,
    private auth: AuthService,
    private location: Location,
    private cd: ChangeDetectorRef,
    private pdfService: PdfService // Inject PdfService
  ) { }

  goBack() {
    this.location.back();
  }

  // To hold the resume being exported
  exportResume: any | null = null;

  onExport(resume: any) {
    this.exportResume = resume;
    this.cd.detectChanges(); // Force update to render the hidden container

    // Slight delay to ensure DOM is ready
    setTimeout(() => {
      const elementId = 'search-export-container';
      if (resume.personalInfo) {
        this.pdfService.exportToPdf(elementId, `profile-${resume.personalInfo.fullName}`, 'theme-modern');
      }
    }, 100);
  }

  ngOnInit() {
    this.route.queryParams.pipe(
      switchMap(params => {
        this.query = params['q'] || '';

        if (this.query) {
          return forkJoin({
            resumes: this.resumeService.searchResumes(this.query),
            users: this.auth.getAllUsers().pipe(catchError(() => of([])))
          });
        }
        return of({ resumes: [], users: [] });
      })
    ).subscribe(({ resumes, users }) => {
      if (this.query) {
        this.results = resumes.map((r: any) => {
          const user = (users as any[]).find(u => u.id === r.userId);
          return { ...r, avatar: user?.avatar };
        });


        this.cd.detectChanges();
      } else {
        this.results = [];
      }
    });
  }
}
