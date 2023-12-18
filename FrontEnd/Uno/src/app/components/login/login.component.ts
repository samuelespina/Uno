import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IUserCredentials } from '../../Interfaces/IUserCredentials.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  data!: IUserCredentials;
  token: string = 'null';
  errorMessage: string = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });
  }
  async Submit() {
    for (var [key, value] of Object.entries(this.loginForm.controls)) {
      this.data = { ...this.data, [key]: value.value };
    }
    const loginSubscription: Subscription = this.auth
      .Login(this.data)
      .subscribe({
        next: (callStatus) => {
          console.log(callStatus);
          if (!callStatus) {
            this.errorMessage = this.auth.errorMessage;
            console.log(this.errorMessage), console.log(this.auth.errorMessage);
          }
        },
        error: (err) => {
          console.log(err.error);
        },
        complete: () => {
          loginSubscription.unsubscribe();
        },
      });
  }
}
