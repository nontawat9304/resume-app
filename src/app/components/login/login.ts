import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

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
  shakeError = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.shakeError = false; // Reset shake

      const { email, password } = this.loginForm.value;
      this.auth.login(email, password)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        }))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.router.navigate(['/dashboard']);
            } else {
              this.triggerErrorShake(res.message || 'AUTH.INVALID_CREDENTIALS');
            }
          },
          error: (errKey) => {
            this.triggerErrorShake(errKey);
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  triggerErrorShake(messageKey: string) {
    this.error = this.translate.instant(messageKey) || messageKey;
    this.shakeError = false;
    this.cd.detectChanges();

    // Tiny delay to restart animation
    setTimeout(() => {
      this.shakeError = true;
      this.cd.detectChanges();
    }, 50);
  }
}
