import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../core/services/auth.service';
import { Role } from '../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    role: ['' as Role | '', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatch });

  roles: { value: Role; label: string }[] = [
    { value: 'CITIZEN',            label: 'Citizen' },
    { value: 'TRAFFIC_OFFICER',    label: 'Traffic Officer' },
    { value: 'TRANSPORT_OPERATOR', label: 'Transport Operator' },
    { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' }
  ];

  loading = false;
  error = '';
  success = false;
  successMessage = '';
  isCitizen = false;
  hidePassword = true;
  hideConfirm = true;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    if (this.auth.isLoggedIn()) this.auth.redirectToDashboard();
  }

  private passwordMatch(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { name, email, phone, role, password } = this.form.value;
    this.auth.register({ name: name!, email: email!, phone: phone!, role: role as Role, password: password! }).subscribe({
      next: (res) => {
        this.success = true;
        this.successMessage = res.message;
        this.isCitizen = (role as Role) === 'CITIZEN';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
