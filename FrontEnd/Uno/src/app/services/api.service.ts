import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private router: Router) {}

  Get<T>(url: string, options?: any) {
    return this.ReqCall<T>('GET', url, undefined, options);
  }

  Post<T>(url: string, body: any, options?: any) {
    return this.ReqCall<T>('POST', url, body, options);
  }

  Put<T>(url: string, body: any, options?: any) {
    return this.ReqCall<T>('PUT', url, body, options);
  }

  Delete<T>(url: string, options?: any) {
    return this.ReqCall<T>('DELETE', url, undefined, options);
  }

  Patch<T>(url: string, options?: any, body?: any) {
    return this.ReqCall<T>('PATCH', url, body, options);
  }

  ReqCall<T>(
    method: string,
    url: string,
    body?: any,
    options?: any,
    withCredentials?: boolean
  ) {
    method = method.toUpperCase();

    if (method === 'GET' || method === 'DELETE') {
      if (body) {
        throw new Error('Body is not required');
      }
    } else {
      if (!body && method !== 'PATCH') {
        throw new Error('Body is required');
      }
    }

    if (!options) {
      options = {};
      options.observe = 'body';
      options.withCredentials = false;
      options.body = body;
      options.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
    }
    options.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    options.withCredentials = false;
    if (options.withCredentials) {
      const token = localStorage.getItem('token');
      options.body.token = token || '';
    }

    return this.http.request<T>(method, url, options).pipe(
      catchError((err) => {
        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['login']);
        }
        return throwError(() => err);
      })
    ) as Observable<T>;
  }
}
