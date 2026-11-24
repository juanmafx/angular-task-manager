import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api-base-url.token';
import { ApiClient } from './api-client.service';

describe('ApiClient', () => {
  let client: ApiClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
        ),
        provideHttpClientTesting(),
      ],
    });
    client = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    http.verify();
  });

  it('defaults to a same-origin base URL', () => {
    expect(TestBed.inject(API_BASE_URL)).toBe('/api');
  });

  it.each([
    ['GET', () => client.get('tasks')],
    ['POST', () => client.post('tasks', { a: 1 })],
    ['PUT', () => client.put('tasks/1', { a: 1 })],
    ['DELETE', () => client.delete('tasks/1')],
  ])('sends %s to the resolved URL', (method, call) => {
    call().subscribe();
    const request = http.expectOne((candidate) => candidate.url.startsWith('/api/tasks'));
    expect(request.request.method).toBe(method);
    request.flush({});
  });

  it.each([
    '../admin',
    'tasks/../../admin',
    '//evil.example',
    'https://evil.example',
    'tasks?x=1',
    '',
  ])('rejects unsafe endpoint %j without sending a request', async (endpoint) => {
    await expect(firstValueFrom(client.get(endpoint))).rejects.toThrow('Invalid API endpoint');
    http.expectNone(() => true);
  });

  it('attaches the XSRF header to same-origin mutations', () => {
    document.cookie = 'XSRF-TOKEN=test-value';
    client.post('tasks', {}).subscribe();
    const request = http.expectOne('/api/tasks');
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('test-value');
    request.flush({});
  });

  it('does not attach the XSRF header to reads', () => {
    document.cookie = 'XSRF-TOKEN=test-value';
    client.get('tasks').subscribe();
    const request = http.expectOne('/api/tasks');
    expect(request.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    request.flush([]);
  });
});
