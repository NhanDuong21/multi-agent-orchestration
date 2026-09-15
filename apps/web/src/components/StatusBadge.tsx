import { STATUS_LABELS, type IssueStatus } from '../../../../packages/shared/src/index';

const colors: Record<IssueStatus, string> = {
  open: 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100'
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-colors ${colors[status]}`}>{STATUS_LABELS[status]}</span>;
}
