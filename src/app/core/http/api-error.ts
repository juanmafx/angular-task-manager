import { HttpErrorResponse } from '@angular/common/http';

export function toUserMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Please try again.';
  }
  if (error.status === 0) {
    return 'The API is unreachable. Check that the backend is running.';
  }
  if (error.status === 401 || error.status === 403) {
    return 'You are not allowed to perform this action.';
  }
  if (error.status === 404) {
    return 'The requested task no longer exists.';
  }
  if (error.status === 400 || error.status === 422) {
    return 'The API rejected the submitted data.';
  }
  return 'The API failed to process the request.';
}
