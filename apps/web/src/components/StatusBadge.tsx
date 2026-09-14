import { STATUS_LABELS, type IssueStatus } from '../../../../packages/shared/src/index';

const colors: Record<IssueStatus, string> = {
  open: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-50 text-blue-800',
  done: 'bg-emerald-50 text-emerald-800'
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}>{STATUS_LABELS[status]}</span>;
}
