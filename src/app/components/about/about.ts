import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center animate__animated animate__fadeInUp">
            <h1 class="display-4 fw-bold text-primary mb-4">About the Creator</h1>
            
            <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
                <div class="card-body p-5">
                    <div class="mb-4">
                         <div class="rounded-circle bg-primary text-white d-inline-flex justify-content-center align-items-center shadow p-4 mb-3"
                            style="width: 120px; height: 120px; font-size: 3rem;">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <h2 class="fw-bold">Nontawat Kaewjeen</h2>
                        <p class="text-muted lead">Developer & Creator</p>
                    </div>

                    <div class="list-group list-group-flush text-start rounded-3">
                        <div class="list-group-item p-3 d-flex align-items-center">
                            <i class="bi bi-envelope-fill text-primary fs-4 me-3"></i>
                            <div>
                                <h6 class="mb-0 text-muted small">Email</h6>
                                <span class="fw-bold">n.nontawat.ka@gmail.com</span>
                            </div>
                        </div>
                        <div class="list-group-item p-3 d-flex align-items-center">
                            <i class="bi bi-facebook text-primary fs-4 me-3"></i>
                            <div>
                                <h6 class="mb-0 text-muted small">Facebook</h6>
                                <span class="fw-bold">nontawat</span>
                            </div>
                        </div>
                        <div class="list-group-item p-3 d-flex align-items-center">
                            <i class="bi bi-telephone-fill text-primary fs-4 me-3"></i>
                            <div>
                                <h6 class="mb-0 text-muted small">Phone</h6>
                                <span class="fw-bold">0987654321</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 p-3 bg-light rounded text-muted small">
                         <i class="bi bi-code-slash me-1"></i> Built with <strong>Angular</strong>, designed for professional growth.
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent { }
