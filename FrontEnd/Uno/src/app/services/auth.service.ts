import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { IUserCredentials } from '../Interfaces/IUserCredentials.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  errorMessage: string = '';

  constructor(private api: ApiService, private router: Router) {}

  async sha256(message: string): Promise<string> {
    const encoder: TextEncoder = new TextEncoder();
    const data = encoder.encode(message);

    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      return hashHex;
    } catch (error) {
      throw new Error('Error calculating hash');
    }
  }

  Login(body: IUserCredentials) {
    let callStatusSubject: Subject<boolean> = new Subject<boolean>();

    const tokenGenerationSubscription: Subscription = this.api
      .Post<string>(
        `${environment.apiAuthEndpoint}/api/UserService/generateChallenge`,
        body
      )
      .subscribe({
        next: async (challenge) => {
          let passwordHash: string = await this.sha256(body.password);
          let passwordHashWithChallenge: string = passwordHash + challenge;
          body.password = passwordHashWithChallenge;

          const verifyCredentialsSubscription: Subscription = this.api
            .Post<string>(
              `${environment.apiAuthEndpoint}/api/UserService/verifyCredentials`,
              body
            )
            .subscribe({
              next: (token) => {
                console.log(token);
                localStorage.setItem('token', token);
                const returnViewSubscription: Subscription = this.api
                  .Post<Array<string>>(
                    `${environment.apiAuthEndpoint}/api/UserService/returnUserInfo`,
                    body
                  )
                  .subscribe({
                    next: (info) => {
                      localStorage.setItem('id', info[0]);
                      localStorage.setItem('name', info[1]);
                      localStorage.setItem('surname', info[2]);
                      this.router.navigate(['']);
                      callStatusSubject.next(true);
                    },
                    error: (err) => console.log(err),
                    complete: () => returnViewSubscription.unsubscribe(),
                  });
              },
              error: (err) => {
                this.errorMessage = 'password wrong';
                callStatusSubject.next(false);
              },
              complete: () => verifyCredentialsSubscription.unsubscribe(),
            });
        },
        error: (err) => {
          this.errorMessage = 'email wrong';
          callStatusSubject.next(false);
        },
        complete: () => tokenGenerationSubscription.unsubscribe(),
      });
    return callStatusSubject;
  }
}
