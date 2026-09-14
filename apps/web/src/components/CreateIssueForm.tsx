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
      <h2 id="create-heading" className="text-lg font-semibold">Tạo phiếu</h2>
      <p className="mt-1 text-sm text-slate-500">Ghi lại công việc hoặc lỗi cần xử lý.</p>
      <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
        <div>
          <label htmlFor="title" className="label">Tiêu đề <span className="text-slate-500">(bắt buộc)</span></label>
          <input id="title" name="title" className="field" value={title} maxLength={TITLE_MAX_LENGTH} required
            aria-invalid={Boolean(titleError)} aria-describedby={`title-hint${titleError ? ' title-error' : ''}`}
            disabled={submitting} onChange={event => { setTitle(event.target.value); setTitleError(''); }}
            placeholder="Ví dụ: Kiểm tra form tạo phiếu" />
          <p id="title-hint" className="mt-1 text-xs text-slate-500">Tối đa {TITLE_MAX_LENGTH} ký tự.</p>
          {titleError && <p id="title-error" role="alert" className="mt-1 text-sm text-red-700">{titleError}</p>}
        </div>
        <div>
          <label htmlFor="description" className="label">Mô tả</label>
          <textarea id="description" name="description" className="field min-h-24 resize-y" rows={3}
            value={description} maxLength={DESCRIPTION_MAX_LENGTH} disabled={submitting}
            onChange={event => setDescription(event.target.value)} aria-describedby="description-hint"
            placeholder="Thêm nội dung, bước thực hiện hoặc kết quả mong đợi…" />
          <p id="description-hint" className="mt-1 text-xs text-slate-500">Không bắt buộc · Tối đa {DESCRIPTION_MAX_LENGTH} ký tự.</p>
        </div>
        {submitError && <p role="alert" className="error-box">{submitError}</p>}
        <button type="submit" className="primary-button" disabled={disabled || submitting}>
          {submitting ? 'Đang tạo…' : 'Tạo phiếu mới'}
        </button>
      </form>
    </section>
  );
}
