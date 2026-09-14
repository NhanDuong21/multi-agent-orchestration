import { useState, type FormEvent } from 'react';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, type CreateIssueInput } from '../../../../packages/shared/src/index';

interface Props {
  onCreate: (input: CreateIssueInput) => Promise<void>;
  disabled: boolean;
}

export function CreateIssueForm({ onCreate, disabled }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');
    if (!title.trim()) { setTitleError('Vui lòng nhập tiêu đề, không chỉ có khoảng trắng.'); return; }
    setTitleError('');
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), description });
      setTitle('');
      setDescription('');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể tạo phiếu. Vui lòng thử lại.');
    } finally { setSubmitting(false); }
  }

  return (
    <section className="panel" aria-labelledby="create-heading">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 id="create-heading" className="text-xl font-bold tracking-tight text-slate-800">Tạo phiếu mới</h2>
        <p className="mt-1.5 text-sm font-medium text-slate-500">Ghi lại công việc hoặc lỗi cần xử lý.</p>
      </div>
      <form className="mt-5 space-y-5" onSubmit={submit} noValidate>
        <div>
          <label htmlFor="title" className="label">Tiêu đề <span className="font-normal text-slate-500">(bắt buộc)</span></label>
          <input id="title" name="title" className="field" value={title} maxLength={TITLE_MAX_LENGTH} required
            aria-invalid={Boolean(titleError)} aria-describedby={`title-hint${titleError ? ' title-error' : ''}`}
            disabled={submitting} onChange={event => { setTitle(event.target.value); setTitleError(''); }}
            placeholder="Ví dụ: Kiểm tra form tạo phiếu" />
          <p id="title-hint" className="mt-2 text-xs font-medium text-slate-500">Tối đa {TITLE_MAX_LENGTH} ký tự.</p>
          {titleError && <p id="title-error" role="alert" className="mt-2 text-sm font-medium text-red-600">{titleError}</p>}
        </div>
        <div>
          <label htmlFor="description" className="label">Mô tả</label>
          <textarea id="description" name="description" className="field min-h-[100px] resize-y" rows={3}
            value={description} maxLength={DESCRIPTION_MAX_LENGTH} disabled={submitting}
            onChange={event => setDescription(event.target.value)} aria-describedby="description-hint"
            placeholder="Thêm nội dung, bước thực hiện hoặc kết quả mong đợi…" />
          <p id="description-hint" className="mt-2 text-xs font-medium text-slate-500">Không bắt buộc · Tối đa {DESCRIPTION_MAX_LENGTH} ký tự.</p>
        </div>
        {submitError && <p role="alert" className="error-box">{submitError}</p>}
        <button type="submit" className="primary-button mt-2 w-full" disabled={disabled || submitting}>
          {submitting ? (
            <><svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang tạo…</>
          ) : (
            <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> Tạo phiếu mới</>
          )}
        </button>
      </form>
    </section>
  );
}
