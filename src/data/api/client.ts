export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

function errorMessage(body: unknown, status: number): string {
  const error = body as { detail?: unknown; message?: unknown } | null;
  if (typeof error?.detail === 'string') return error.detail;
  if (typeof error?.message === 'string') return error.message;
  if (Array.isArray(error?.detail)) {
    return error.detail.map(item => typeof item?.msg === 'string' ? item.msg : 'Invalid input').join('. ');
  }
  return `The request failed (${status}). Please try again.`;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init, headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error('Cannot reach Kanzi API. Make sure the API is running and its address is configured.');
  }
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(errorMessage(body, response.status), response.status);
  if (body === null && response.status !== 204) throw new Error('The API did not return a JSON response.');
  return body;
}
