import type {
  CreateIssueInput, IssueListResponse, IssueResponse, IssueStatus
} from '../../../packages/shared/src/index';

const connectionMessage = 'Không thể kết nối API. Kiểm tra backend đang chạy rồi thử lại.';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(connectionMessage, { cause: error });
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body
      && body.error && typeof body.error === 'object' && 'message' in body.error
      && typeof body.error.message === 'string' ? body.error.message : connectionMessage;
    throw new Error(message);
  }
  if (body === null) throw new Error(connectionMessage);
  return body as T;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export const api = {
  list: (signal?: AbortSignal) => request<IssueListResponse>('/issues', { signal }),
  find: (id: number, signal?: AbortSignal) => request<IssueResponse>(`/issues/${id}`, { signal }),
  create: (input: CreateIssueInput) => request<IssueResponse>('/issues', { method: 'POST', body: JSON.stringify(input) }),
  updateStatus: (id: number, status: IssueStatus) => request<IssueResponse>(`/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};
