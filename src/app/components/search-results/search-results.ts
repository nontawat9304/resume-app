import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { ResumeService, Resume } from '../../services/resume';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

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
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) {
        // Fetch Resumes and Users
        forkJoin({
          resumes: this.resumeService.searchResumes(this.query),
          users: this.auth.getAllUsers()
        }).subscribe(({ resumes, users }) => {
          this.results = resumes.map((r: any) => {
            const user = users.find(u => u.id === r.userId);
            return { ...r, avatar: user?.avatar };
          });
        });
      }
    });
  }
}
