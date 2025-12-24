import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean; // New Flag
  avatar?: string;
  password?: string;
}

// Simple Mock DB since the service file was missing
class MockDB {
  private storage: any = { users: [] };
  constructor() {
    if (typeof localStorage !== 'undefined') {
      const s = localStorage.getItem('mock_db');
      if (s) this.storage = JSON.parse(s);
      else {
        // Seed Admin
        this.storage.users.push({
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'admin',
          role: 'admin',
          isActive: true,
          avatar: ''
        });
        this.save();
      }
    }
  }
  save() {
    if (typeof localStorage !== 'undefined') localStorage.setItem('mock_db', JSON.stringify(this.storage));
  }
  query(table: string, predicate: (item: any) => boolean) { return (this.storage[table] || []).filter(predicate); }
  getAll(table: string) { return this.storage[table] || []; }
  input(table: string, item: any) {
    if (!this.storage[table]) this.storage[table] = [];
    this.storage[table].push(item);
    this.save();
  }
  update(table: string, item: any, predicate: (i: any) => boolean) {
    const idx = this.storage[table].findIndex(predicate);
    if (idx !== -1) {
      this.storage[table][idx] = { ...this.storage[table][idx], ...item };
      this.save();
    }
  }
  delete(table: string, predicate: (i: any) => boolean) {
    this.storage[table] = this.storage[table].filter((i: any) => !predicate(i));
    this.save();
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  private db = new MockDB(); // Internal Mock DB replacement

  constructor(private router: Router) {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('session_user');
      if (stored) {
        this.currentUser.set(JSON.parse(stored));
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    const users = this.db.query('users', (u) => u.email === email && u.password === password);
    if (users.length > 0) {
      const user = users[0];
      if (user.isActive === false) return of({ success: false, message: 'Account is disabled. Contact admin.' });

      const { password, ...safeUser } = user;
      this.setSession(safeUser);
      return of({ success: true, user: safeUser });
    }
    return of({ success: false, message: 'Invalid credentials' });
  }

  register(userData: any): Observable<any> {
    const existing = this.db.query('users', (u) => u.email === userData.email);
    if (existing.length > 0) return new Observable(obs => { obs.error('AUTH.EMAIL_EXISTS'); obs.complete(); });

    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      role: 'user',
      isActive: true, // Default active
      avatar: ''
    };

    this.db.input('users', newUser);
    return of({ success: true, user: newUser });
  }

  // Admin Methods
  getAllUsers(): Observable<User[]> {
    return of(this.db.getAll('users'));
  }

  updateUserStatus(userId: string, isActive: boolean) {
    this.db.update('users', { isActive }, u => u.id === userId);
  }

  updateUserRole(userId: string, role: 'admin' | 'user') {
    this.db.update('users', { role }, u => u.id === userId);
  }

  deleteUser(userId: string) {
    this.db.delete('users', u => u.id === userId);
  }

  // Profile Update
  updateUser(user: User) {
    this.db.update('users', user, u => u.id === user.id);
    this.setSession(user);
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('session_user');
    this.router.navigate(['/login']);
  }

  private setSession(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('session_user', JSON.stringify(user));
    if (user.role === 'admin') this.router.navigate(['/admin']);
    else this.router.navigate(['/dashboard']);
  }

  get isLoggedIn() { return !!this.currentUser(); }
  get isAdmin() { return this.currentUser()?.role === 'admin'; }
}
