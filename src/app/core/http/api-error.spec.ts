import { HttpErrorResponse } from '@angular/common/http';
import { toUserMessage } from './api-error';

describe('toUserMessage', () => {
  it.each([
    [0, 'unreachable'],
    [400, 'rejected'],
    [401, 'not allowed'],
    [403, 'not allowed'],
    [404, 'no longer exists'],
    [422, 'rejected'],
    [500, 'failed to process'],
  ])('maps HTTP %i to a safe message', (status, expected) => {
    expect(toUserMessage(new HttpErrorResponse({ status }))).toContain(expected);
  });

  it('never echoes server-provided error content', () => {
    const error = new HttpErrorResponse({ status: 500, error: { detail: 'stack trace at db.py' } });
    expect(toUserMessage(error)).not.toContain('db.py');
  });

  it('handles non-HTTP errors', () => {
    expect(toUserMessage(new Error('internal detail'))).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
