import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { API_BASE_URL } from '../config/api-base-url.token';

const SAFE_ENDPOINT = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/i;

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(endpoint: string): Observable<T> {
    return defer(() => this.http.get<T>(this.resolve(endpoint)));
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return defer(() => this.http.post<T>(this.resolve(endpoint), body));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return defer(() => this.http.put<T>(this.resolve(endpoint), body));
  }

  delete<T>(endpoint: string): Observable<T> {
    return defer(() => this.http.delete<T>(this.resolve(endpoint)));
  }

  private resolve(endpoint: string): string {
    if (!SAFE_ENDPOINT.test(endpoint)) {
      throw new Error('Invalid API endpoint');
    }
    return `${this.baseUrl}/${endpoint}`;
  }
}
