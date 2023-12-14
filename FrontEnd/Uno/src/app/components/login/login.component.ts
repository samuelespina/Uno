import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { UserCredentials } from '../../Interfaces/UserCredentials.types';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  data!: UserCredentials;
  token: string = 'null';
  errorMessage: string = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });
  }
  Submit() {
    for (var [key, value] of Object.entries(this.loginForm.controls)) {
      this.data = { ...this.data, [key]: value.value };
    }
    const Login: Subscription = this.auth
      .Login(this.data)
      .subscribe((errorMessage: string) => {
        this.errorMessage = errorMessage;
      });
  }
}
