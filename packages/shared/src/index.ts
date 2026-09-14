export const ISSUE_STATUSES = ['open', 'in_progress', 'done'] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Mới',
  in_progress: 'Đang làm',
  done: 'Hoàn thành'
};

export const TITLE_MAX_LENGTH = 160;
export const DESCRIPTION_MAX_LENGTH = 4000;

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
}

export interface UpdateStatusInput { status: IssueStatus }
export interface IssueResponse { issue: Issue }
export interface IssueListResponse { issues: Issue[] }

export interface ApiErrorResponse {
  error: { code: string; message: string; field?: string };
}

export function isIssueStatus(value: unknown): value is IssueStatus {
  return typeof value === 'string' && ISSUE_STATUSES.some(status => status === value);
}
