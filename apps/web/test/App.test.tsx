// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Issue, IssueListResponse, IssueResponse } from '../../../packages/shared/src/index';
import { App } from '../src/App';
import { api } from '../src/api';

const sample: Issue = {
  id: 10, title: 'Phiếu kiểm tra', description: 'Mô tả kiểm tra', status: 'open',
  createdAt: '2026-09-14T10:00:00.000Z', updatedAt: '2026-09-14T10:00:00.000Z'
};

beforeEach(() => {
  // Unit mocks exist only in tests; the running application always uses fetch.
  vi.spyOn(api, 'list').mockResolvedValue({ issues: [] });
  vi.spyOn(api, 'find').mockResolvedValue({ issue: sample });
  vi.spyOn(api, 'create').mockResolvedValue({ issue: sample });
  vi.spyOn(api, 'updateStatus').mockResolvedValue({ issue: { ...sample, status: 'in_progress', updatedAt: '2026-09-14T10:01:00.000Z' } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Vietnamese issue tracker UI', () => {
  it('shows loading then an empty state', async () => {
    let finish!: (value: IssueListResponse) => void;
    vi.mocked(api.list).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    render(<App />);
    expect(screen.getByText('Đang tải danh sách…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo phiếu mới' })).toBeDisabled();
    await act(async () => finish({ issues: [] }));
    expect(await screen.findByText(/Chưa có phiếu nào/)).toBeInTheDocument();
  });

  it('rejects whitespace title without calling the API', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/Chưa có phiếu nào/);
    await user.type(screen.getByLabelText(/Tiêu đề/), '   ');
    await user.click(screen.getByRole('button', { name: 'Tạo phiếu mới' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng nhập tiêu đề');
    expect(api.create).not.toHaveBeenCalled();
  });

  it('creates through the client, selects the detail and saves a status change', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/Chưa có phiếu nào/);
    await user.type(screen.getByLabelText(/Tiêu đề/), '  Phiếu kiểm tra  ');
    await user.type(screen.getByLabelText('Mô tả'), sample.description);
    await user.click(screen.getByRole('button', { name: 'Tạo phiếu mới' }));
    expect(api.create).toHaveBeenCalledWith({ title: sample.title, description: sample.description });
    expect(await screen.findByRole('heading', { level: 3, name: sample.title })).toBeInTheDocument();
    expect(api.find).toHaveBeenCalledWith(sample.id, expect.any(AbortSignal));
    expect(screen.getByLabelText(/Tiêu đề/)).toHaveValue('');
    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'in_progress');
    await waitFor(() => expect(api.updateStatus).toHaveBeenCalledWith(sample.id, 'in_progress'));
    expect(await screen.findByText('Phiếu #10: Đang làm.')).toBeInTheDocument();
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('in_progress');
    expect(screen.getByText('Cập nhật lúc')).toBeInTheDocument();
  });

  it('keeps form data and reports a create failure', async () => {
    vi.mocked(api.create).mockRejectedValue(new Error('Không thể kết nối API.'));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/Chưa có phiếu nào/);
    await user.type(screen.getByLabelText(/Tiêu đề/), sample.title);
    await user.type(screen.getByLabelText('Mô tả'), sample.description);
    await user.click(screen.getByRole('button', { name: 'Tạo phiếu mới' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể kết nối API.');
    expect(screen.getByLabelText(/Tiêu đề/)).toHaveValue(sample.title);
    expect(screen.getByLabelText('Mô tả')).toHaveValue(sample.description);
    expect(screen.getByRole('button', { name: 'Tạo phiếu mới' })).toBeEnabled();
  });

  it('reports list errors and recovers with retry', async () => {
    vi.mocked(api.list).mockRejectedValueOnce(new Error('Không thể kết nối API.')).mockResolvedValue({ issues: [sample] });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể kết nối API.');
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('heading', { level: 3, name: sample.title })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('preserves the saved status when an update fails', async () => {
    vi.mocked(api.list).mockResolvedValue({ issues: [sample] });
    vi.mocked(api.updateStatus).mockRejectedValue(new Error('Không thể kết nối API.'));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 3, name: sample.title });
    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'done');
    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể kết nối API.');
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('open');
    expect(screen.queryByText(/Phiếu #10: Hoàn thành/)).not.toBeInTheDocument();
  });

  it('reports a missing detail while keeping the list accessible', async () => {
    vi.mocked(api.list).mockResolvedValue({ issues: [sample] });
    vi.mocked(api.find).mockRejectedValue(new Error('Không tìm thấy phiếu này.'));
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Không tìm thấy phiếu này.');
    expect(screen.getByRole('button', { name: new RegExp(sample.title) })).toBeEnabled();
  });

  it('ignores an older detail response after another issue is selected', async () => {
    const next = { ...sample, id: 11, title: 'Phiếu thứ hai' };
    let finishOld!: (value: IssueResponse) => void;
    vi.mocked(api.list).mockResolvedValue({ issues: [sample, next] });
    vi.mocked(api.find).mockImplementation(id => id === sample.id
      ? new Promise(resolve => { finishOld = resolve; }) : Promise.resolve({ issue: next }));
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Phiếu thứ hai/ }));
    await screen.findByRole('heading', { level: 3, name: next.title });
    await act(async () => finishOld({ issue: sample }));
    expect(screen.queryByRole('heading', { level: 3, name: sample.title })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: next.title })).toBeInTheDocument();
  });
});
