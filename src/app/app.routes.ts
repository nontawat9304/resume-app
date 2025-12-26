import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { ResumeEditorComponent } from './components/resume-editor/resume-editor';
import { ProfileViewComponent } from './components/profile-view/profile-view';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/home-redirect/home-redirect').then(m => m.HomeRedirectComponent) },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: UserDashboardComponent },
    { path: 'admin', loadComponent: () => import('./components/admin-manage-users/admin-manage-users').then(m => m.AdminManageUsersComponent) },
    { path: 'about', loadComponent: () => import('./components/about/about').then(m => m.AboutComponent) },
    { path: 'editor', component: ResumeEditorComponent },
    { path: 'editor/:id', component: ResumeEditorComponent },
    { path: 'search', loadComponent: () => import('./components/search-results/search-results').then(m => m.SearchResultsComponent), runGuardsAndResolvers: 'always' },
    { path: 'p/:id', component: ProfileViewComponent },
    { path: '**', redirectTo: 'login' }
];
