import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <button class="btn btn-outline-danger" (click)="auth.logout()">Logout</button>
      </div>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">System Statistics</h5>
          <p>Total Users: 12 (Mock)</p>
          <p>Active Resumes: 8 (Mock)</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent {
  constructor(public auth: AuthService) { }
}
