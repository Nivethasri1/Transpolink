import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../core/services/auth.service';

type ErrorType = '' | 'pending' | 'rejected' | 'suspended' | 'invalid';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = false;
  errorType: ErrorType = '';
  hidePassword = true;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.auth.redirectToDashboard();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorType = '';
    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => this.auth.redirectToDashboard(),
      error: (err) => {
        const msg: string = err.error?.message ?? '';
        if (msg.toLowerCase().includes('pending')) this.errorType = 'pending';
        else if (msg.toLowerCase().includes('rejected')) this.errorType = 'rejected';
        else if (msg.toLowerCase().includes('suspended')) this.errorType = 'suspended';
        else this.errorType = 'invalid';
        this.loading = false;
      }
    });
  }
}
