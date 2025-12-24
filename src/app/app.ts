import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeService } from './services/resume';
import { AuthService } from './services/auth'; // Import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  searchTerm: string = '';

  constructor(
    public translate: TranslateService,
    private router: Router,
    private resumeService: ResumeService,
    public auth: AuthService // Inject Publicly
  ) {
    translate.setDefaultLang('th');
    translate.use('th');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
      this.searchTerm = ''; // Clear search term after navigation
    }
  }

  logout() {
    this.auth.logout();
  }
}
