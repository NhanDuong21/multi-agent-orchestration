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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 animate-fade-in">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-white/40 p-6 shadow-sm ring-1 ring-white/60 backdrop-blur-lg">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span></span>
            Bảng công việc
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Mini Issue Tracker</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Tạo, theo dõi và hoàn thành công việc của bạn một cách dễ dàng.</p>
        </div>
        <button className="secondary-button" disabled={listLoading || saving} onClick={() => { setNotice(''); setRefresh(value => value + 1); }}>Tải lại danh sách</button>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '100ms' }} aria-label="Tổng quan trạng thái">
        {ISSUE_STATUSES.map(status => (
          <div key={status} className="group flex flex-col rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md">
            <p className="text-sm font-semibold tracking-wide text-slate-500 group-hover:text-slate-700 transition-colors">{STATUS_LABELS[status]}</p>
            <p className="mt-2 text-3xl font-bold text-slate-800 tracking-tight">{listLoading ? '…' : listError ? '—' : issues.filter(item => item.status === status).length}</p>
          </div>
        ))}
      </div>
      {notice && <p role="status" className="mb-6 rounded-xl border border-emerald-200/60 bg-emerald-50/80 p-4 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm animate-fade-in-up">{notice}</p>}

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="min-w-0 space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CreateIssueForm onCreate={create} disabled={listLoading || saving} />
          <section className="panel" aria-labelledby="list-heading" aria-busy={listLoading}>
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h2 id="list-heading" className="text-xl font-bold tracking-tight text-slate-800">Danh sách phiếu</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{issues.length} phiếu</span>
            </div>
            {listLoading && <p role="status" className="py-4 text-sm text-slate-500">Đang tải danh sách…</p>}
            {listError && <div className="error-box"><p role="alert">{listError}</p><button className="mt-2 font-semibold underline" disabled={listLoading || saving} onClick={() => setRefresh(value => value + 1)}>Thử lại</button></div>}
            {!listLoading && !listError && issues.length === 0 && <p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Chưa có phiếu nào. Tạo phiếu đầu tiên bằng form phía trên.</p>}
            {issues.length > 0 && <ul className="space-y-3">
              {issues.map(item => <li key={item.id} className="animate-fade-in">
                <button className={`group relative w-full rounded-xl border p-4 text-left transition-all duration-300 disabled:opacity-60 ${selectedId === item.id ? 'border-blue-500 bg-blue-50/80 shadow-md shadow-blue-500/10' : 'border-slate-200/60 bg-white/50 hover:border-blue-300 hover:bg-white hover:shadow-md'}`}
                  disabled={saving} aria-pressed={selectedId === item.id}
                  onClick={() => { setSelectedId(item.id); setNotice(''); }}>
                  <span className="flex flex-wrap items-center justify-between gap-3"><span className={`text-xs font-bold ${selectedId === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500 transition-colors'}`}>#{item.id}</span><StatusBadge status={item.status} /></span>
                  <span className={`mt-3 block font-semibold leading-snug [overflow-wrap:anywhere] ${selectedId === item.id ? 'text-blue-900' : 'text-slate-800'}`}>{item.title}</span>
                  <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <time dateTime={item.createdAt}>{timestamp(item.createdAt)}</time>
                  </span>
                </button>
              </li>)}
            </ul>}
          </section>
        </div>

        <section className="panel min-w-0 lg:sticky lg:top-8 animate-fade-in-up" style={{ animationDelay: '300ms' }} aria-labelledby="detail-heading" aria-busy={detailLoading}>
          <h2 id="detail-heading" className="text-xl font-bold tracking-tight text-slate-800 mb-5 border-b border-slate-100 pb-4">Chi tiết phiếu</h2>
          {selectedId === null && <p className="mt-5 py-8 text-center text-sm text-slate-500">Chọn một phiếu trong danh sách để xem nội dung.</p>}
          {detailLoading && <p role="status" className="mt-5 py-4 text-sm text-slate-500">Đang tải chi tiết…</p>}
          {detailError && <div className="error-box mt-5"><p role="alert">{detailError}</p><button className="mt-2 font-semibold underline" disabled={listLoading || saving} onClick={() => setRefresh(value => value + 1)}>Tải lại chi tiết</button></div>}
          {issue && !detailLoading && <div className="space-y-6 animate-fade-in">
            <div><div className="mb-3 flex items-center gap-3"><span className="text-sm font-bold text-slate-400">#{issue.id}</span><StatusBadge status={issue.status} /></div>
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 [overflow-wrap:anywhere]">{issue.title}</h3>
            </div>
            <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-100">
              <h4 className="label !mb-2">Mô tả</h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">{issue.description || <span className="italic text-slate-400">Chưa có mô tả.</span>}</p>
            </div>
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
