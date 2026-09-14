import { useEffect, useState } from 'react';
import { ISSUE_STATUSES, STATUS_LABELS, type CreateIssueInput, type Issue, type IssueStatus } from '../../../packages/shared/src/index';
import { api, isAbortError } from './api';
import { CreateIssueForm } from './components/CreateIssueForm';
import { StatusBadge } from './components/StatusBadge';

function timestamp(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value));
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
}

export function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setListLoading(true);
    setListError('');
    api.list(controller.signal).then(({ issues: result }) => {
      if (!active) return;
      setIssues(result);
      setSelectedId(current => current ?? result[0]?.id ?? null);
    }).catch(error => {
      if (active && !isAbortError(error)) setListError(message(error));
    }).finally(() => { if (active) setListLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [refresh]);

  useEffect(() => {
    if (selectedId === null) return;
    const controller = new AbortController();
    let active = true;
    setDetailLoading(true);
    setDetailError('');
    setMutationError('');
    setIssue(null);
    api.find(selectedId, controller.signal).then(({ issue: result }) => {
      if (active) setIssue(result);
    }).catch(error => {
      if (active && !isAbortError(error)) setDetailError(message(error));
    }).finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [selectedId, refresh]);

  async function create(input: CreateIssueInput) {
    setSaving(true);
    setNotice('');
    try {
      const { issue: created } = await api.create(input);
      setIssues(current => [created, ...current]);
      setSelectedId(created.id);
      setNotice(`Đã tạo phiếu #${created.id}.`);
    } finally { setSaving(false); }
  }

  async function updateStatus(status: IssueStatus) {
    if (!issue || status === issue.status) return;
    setSaving(true);
    setMutationError('');
    setNotice('');
    try {
      const { issue: updated } = await api.updateStatus(issue.id, status);
      setIssue(updated);
      setIssues(current => current.map(item => item.id === updated.id ? updated : item));
      setNotice(`Phiếu #${updated.id}: ${STATUS_LABELS[updated.status]}.`);
    } catch (error) { setMutationError(message(error)); }
    finally { setSaving(false); }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Bảng công việc</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Mini Issue Tracker</h1>
          <p className="mt-2 text-sm text-slate-600">Tạo, theo dõi và hoàn thành công việc của bạn.</p>
        </div>
        <button className="secondary-button" disabled={listLoading || saving} onClick={() => { setNotice(''); setRefresh(value => value + 1); }}>Tải lại danh sách</button>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-3" aria-label="Tổng quan trạng thái">
        {ISSUE_STATUSES.map(status => (
          <div key={status} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <p className="text-xs text-slate-600 sm:text-sm">{STATUS_LABELS[status]}</p>
            <p className="mt-1 text-2xl font-semibold">{listLoading ? '…' : listError ? '—' : issues.filter(item => item.status === status).length}</p>
          </div>
        ))}
      </div>
      {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <CreateIssueForm onCreate={create} disabled={listLoading || saving} />
          <section className="panel" aria-labelledby="list-heading" aria-busy={listLoading}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="list-heading" className="text-lg font-semibold">Danh sách phiếu</h2>
              <span className="text-sm text-slate-500">{issues.length} phiếu</span>
            </div>
            {listLoading && <p role="status" className="py-4 text-sm text-slate-500">Đang tải danh sách…</p>}
            {listError && <div className="error-box"><p role="alert">{listError}</p><button className="mt-2 font-semibold underline" disabled={listLoading || saving} onClick={() => setRefresh(value => value + 1)}>Thử lại</button></div>}
            {!listLoading && !listError && issues.length === 0 && <p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Chưa có phiếu nào. Tạo phiếu đầu tiên bằng form phía trên.</p>}
            {issues.length > 0 && <ul className="space-y-2">
              {issues.map(item => <li key={item.id}>
                <button className={`w-full rounded-lg border p-3 text-left transition-colors disabled:opacity-60 ${selectedId === item.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  disabled={saving} aria-pressed={selectedId === item.id}
                  onClick={() => { setSelectedId(item.id); setNotice(''); }}>
                  <span className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-500">#{item.id}</span><StatusBadge status={item.status} /></span>
                  <span className="mt-2 block font-medium [overflow-wrap:anywhere]">{item.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">Tạo lúc <time dateTime={item.createdAt}>{timestamp(item.createdAt)}</time></span>
                </button>
              </li>)}
            </ul>}
          </section>
        </div>

        <section className="panel min-w-0 lg:sticky lg:top-6" aria-labelledby="detail-heading" aria-busy={detailLoading}>
          <h2 id="detail-heading" className="text-lg font-semibold">Chi tiết phiếu</h2>
          {selectedId === null && <p className="mt-5 py-8 text-center text-sm text-slate-500">Chọn một phiếu trong danh sách để xem nội dung.</p>}
          {detailLoading && <p role="status" className="mt-5 py-4 text-sm text-slate-500">Đang tải chi tiết…</p>}
          {detailError && <div className="error-box mt-5"><p role="alert">{detailError}</p><button className="mt-2 font-semibold underline" disabled={listLoading || saving} onClick={() => setRefresh(value => value + 1)}>Tải lại chi tiết</button></div>}
          {issue && !detailLoading && <div className="mt-5 space-y-5">
            <div><div className="mb-2 flex items-center gap-3"><span className="text-sm text-slate-500">#{issue.id}</span><StatusBadge status={issue.status} /></div>
              <h3 className="text-xl font-semibold [overflow-wrap:anywhere]">{issue.title}</h3>
            </div>
            <div><h4 className="label">Mô tả</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{issue.description || 'Chưa có mô tả.'}</p></div>
            <div>
              <label htmlFor="status" className="label">Trạng thái</label>
              <select id="status" className="field" value={issue.status} disabled={saving || listLoading}
                onChange={event => { void updateStatus(event.target.value as IssueStatus); }} aria-describedby="status-hint">
                {ISSUE_STATUSES.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
              </select>
              <p id="status-hint" className="mt-2 text-xs text-slate-500">{saving ? 'Đang lưu thay đổi…' : 'Thay đổi được lưu ngay khi chọn trạng thái.'}</p>
              {mutationError && <p role="alert" className="error-box mt-3">{mutationError}</p>}
            </div>
            <dl className="space-y-3 border-t border-slate-200 pt-4 text-sm">
              <div><dt className="text-slate-500">Tạo lúc</dt><dd className="mt-1"><time dateTime={issue.createdAt}>{timestamp(issue.createdAt)}</time></dd></div>
              <div><dt className="text-slate-500">Cập nhật lúc</dt><dd className="mt-1"><time dateTime={issue.updatedAt}>{timestamp(issue.updatedAt)}</time></dd></div>
            </dl>
          </div>}
        </section>
      </div>
    </main>
  );
}
