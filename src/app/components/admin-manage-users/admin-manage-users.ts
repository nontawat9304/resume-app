import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms'; // For search/filter if needed

@Component({
    selector: 'app-admin-manage-users',
    standalone: true,
    imports: [CommonModule, TranslateModule, FormsModule],
    template: `
    <div class="container my-5">
      <h2 class="mb-4 fw-bold text-primary">Admin Control Panel</h2>
      
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0">User Management</h5>
            <span class="badge bg-primary rounded-pill">{{ users.length }} Users</span>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4" style="width: 40%;">User</th>
                            <th style="width: 20%;">Role</th>
                            <th style="width: 20%;">Status</th>
                            <th class="text-end pe-4" style="width: 20%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let user of users">
                            <td class="ps-4">
                                <div class="d-flex align-items-center">
                                    <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                                        style="width: 40px; height: 40px; background-size: cover; background-position: center;"
                                        [style.background-image]="user.avatar ? 'url(' + user.avatar + ')' : ''">
                                        <span *ngIf="!user.avatar">{{ user.name.charAt(0).toUpperCase() }}</span>
                                    </div>
                                    <div class="text-truncate" style="max-width: 200px;">
                                        <div class="fw-bold text-truncate" [title]="user.name">{{ user.name }}</div>
                                        <small class="text-muted d-block text-truncate" [title]="user.email">{{ user.email }}</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge" [ngClass]="user.role === 'admin' ? 'bg-warning text-dark' : 'bg-info bg-opacity-10 text-info'">{{ user.role }}</span>
                            </td>
                            <td>
                                <div class="form-check form-switch" style="min-width: 100px;">
                                    <input class="form-check-input" type="checkbox" [checked]="user.isActive" 
                                           (change)="toggleStatus(user)" [disabled]="user.email === auth.currentUser()?.email">
                                    <label class="form-check-label small" [class.text-success]="user.isActive" [class.text-danger]="!user.isActive">
                                        {{ user.isActive ? 'Active' : 'Disabled' }}
                                    </label>
                                </div>
                            </td>
                            <td class="text-end pe-4">
                                <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(user)"
                                    [disabled]="user.role === 'admin'">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  `
})
export class AdminManageUsersComponent implements OnInit {
    users: User[] = [];

    constructor(public auth: AuthService) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.auth.getAllUsers().subscribe(u => this.users = u);
    }

    toggleStatus(user: User) {
        if (user.email === this.auth.currentUser()?.email) return;
        const newStatus = !user.isActive;
        this.auth.updateUserStatus(user.id, newStatus);
        user.isActive = newStatus; // Optimistic update
    }

    deleteUser(user: User) {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            this.auth.deleteUser(user.id);
            this.loadUsers();
        }
    }
}
