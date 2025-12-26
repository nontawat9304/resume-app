import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { ResumeService, Resume } from '../../services/resume';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';
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
    private cd: ChangeDetectorRef
  ) { }

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.route.queryParams.pipe(
      switchMap(params => {
        this.query = params['q'] || '';
        console.log('Search Query:', this.query);

        if (this.query) {
          return forkJoin({
            resumes: this.resumeService.searchResumes(this.query),
            users: this.auth.getAllUsers().pipe(catchError(() => of([])))
          });
        }
        return of({ resumes: [], users: [] });
      })
    ).subscribe(({ resumes, users }) => {
      console.log('Search Results:', resumes);
      if (this.query) {
        this.results = resumes.map((r: any) => {
          const user = (users as any[]).find(u => u.id === r.userId);
          return { ...r, avatar: user?.avatar };
        });
        this.cd.detectChanges();
      } else {
        this.results = [];
      }
    }, error => {
      console.error('Search Error:', error);
    });
  }
}
