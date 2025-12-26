import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeService } from './services/resume';
import { AuthService } from './services/auth';
import { DataMigrationService } from './services/data-migration.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  searchTerm: string = '';
  hasLocalData = false;

  constructor(
    public translate: TranslateService,
    private router: Router,
    private resumeService: ResumeService,
    public auth: AuthService,
    private migrationService: DataMigrationService
  ) {

    translate.setDefaultLang('th');
    translate.use('th');
  }

  ngOnInit() {
    // Check for legacy data
    if (typeof localStorage !== 'undefined') {
      const localResumes = localStorage.getItem('sql_db_resumes');
      if (localResumes && JSON.parse(localResumes).length > 0) {
        this.hasLocalData = true;
      }
    }
  }

  async migrateData() {
    if (!this.auth.currentUser()) {
      alert('Please Login first to migrate (sync) your old data.');
      this.router.navigate(['/login']);
      return;
    }

    if (confirm('Sync old local data to your Cloud Account?')) {
      const count = await this.migrationService.importLocalResumesToAccount(this.auth.currentUser()!.id);
      alert(`Migrated ${count} resumes successfully!`);
      this.hasLocalData = false;
      localStorage.removeItem('sql_db_resumes'); // Clear after migration
    }
  }

  dismissMigration() {
    this.hasLocalData = false;
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      // Force reload if already on search page
      if (this.router.url.startsWith('/search')) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
        });
      } else {
        this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
      }
      // Keep searchTerm for UX? Or clear? User preference.
      // this.searchTerm = ''; 
    }
  }

  logout() {
    this.auth.logout();
  }
}
