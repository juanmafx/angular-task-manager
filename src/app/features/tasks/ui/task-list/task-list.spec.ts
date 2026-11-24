import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskList } from './task-list';

describe('TaskList', () => {
  let fixture: ComponentFixture<TaskList>;
  let http: HttpTestingController;
  let element: HTMLElement;

  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  async function render(tasks: unknown[]): Promise<void> {
    fixture.detectChanges();
    http.expectOne('/api/tasks').flush(tasks);
    await settle();
  }

  function button(label: string): HTMLButtonElement {
    return element.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TaskList);
    element = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  it('shows the empty state', async () => {
    await render([]);
    expect(element.textContent).toContain('No tasks yet.');
  });

  it('renders tasks with readable status labels', async () => {
    await render([{ id: 1, title: 'Ship', status: 'in_progress' }]);
    expect(element.querySelector('strong')?.textContent).toBe('Ship');
    const badge = element.querySelector('.badge');
    expect(badge?.textContent).toBe('In progress');
    expect(badge?.classList.contains('badge--in_progress')).toBe(true);
  });

  it('renders hostile titles as inert text', async () => {
    const hostile = '<img src=x onerror=alert(1)>';
    await render([{ id: 1, title: hostile, status: 'pending' }]);
    expect(element.querySelector('strong')?.textContent).toBe(hostile);
    expect(element.querySelector('img')).toBeNull();
  });

  it('submits the form and clears the input on success', async () => {
    await render([]);
    const input = element.querySelector('input') as HTMLInputElement;
    input.value = '  New task  ';
    input.dispatchEvent(new Event('input'));
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    const create = http.expectOne({ method: 'POST', url: '/api/tasks' });
    expect(create.request.body).toEqual({ title: 'New task', status: 'pending' });
    create.flush({ id: 1 });
    await settle();
    http
      .expectOne({ method: 'GET', url: '/api/tasks' })
      .flush([{ id: 1, title: 'New task', status: 'pending' }]);
    await settle();
    expect(input.value).toBe('');
    expect(element.querySelector('strong')?.textContent).toBe('New task');
  });

  it('keeps the input and shows an alert when creation fails', async () => {
    await render([]);
    const input = element.querySelector('input') as HTMLInputElement;
    input.value = 'Keep me';
    input.dispatchEvent(new Event('input'));
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    http
      .expectOne({ method: 'POST', url: '/api/tasks' })
      .flush('failure', { status: 500, statusText: 'Server Error' });
    await settle();
    expect(input.value).toBe('Keep me');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('failed to process');
  });

  it('advances a task status from its button', async () => {
    await render([{ id: 3, title: 'Ship', status: 'pending' }]);
    button('Advance status of Ship').click();
    const update = http.expectOne({ method: 'PUT', url: '/api/tasks/3' });
    expect(update.request.body).toEqual({ status: 'in_progress' });
    update.flush({});
    await settle();
    http
      .expectOne({ method: 'GET', url: '/api/tasks' })
      .flush([{ id: 3, title: 'Ship', status: 'in_progress' }]);
    await settle();
    expect(element.querySelector('.badge')?.textContent).toBe('In progress');
  });

  it('deletes a task from its button', async () => {
    await render([{ id: 3, title: 'Ship', status: 'pending' }]);
    button('Delete Ship').click();
    http.expectOne({ method: 'DELETE', url: '/api/tasks/3' }).flush(null);
    await settle();
    http.expectOne({ method: 'GET', url: '/api/tasks' }).flush([]);
    await settle();
    expect(element.textContent).toContain('No tasks yet.');
  });
});
