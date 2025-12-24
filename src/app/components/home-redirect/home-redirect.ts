import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-home-redirect',
    standalone: true,
    template: ''
})
export class HomeRedirectComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) { }

    ngOnInit() {
        if (this.auth.isLoggedIn) {
            this.router.navigate(['/dashboard']);
        } else {
            this.router.navigate(['/login']);
        }
    }
}
