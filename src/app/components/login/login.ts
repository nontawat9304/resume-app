import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private translate: TranslateService // Inject
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true; // Start loading
      const { email, password } = this.loginForm.value;
      this.auth.login(email, password).subscribe({
        next: (res: any) => {
          this.isLoading = false; // Stop loading
          if (res.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.error = this.translate.instant(res.message || 'AUTH.INVALID_CREDENTIALS');
          }
        },
        error: (errKey) => {
          this.isLoading = false; // Stop loading
          this.error = this.translate.instant(errKey) || errKey;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
