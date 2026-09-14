import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../src/api';

afterEach(() => vi.unstubAllGlobals());

describe('HTTP API client', () => {
  it('uses the real API contract for create and status update', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ issue: { id: 1 } })));
    vi.stubGlobal('fetch', fetchMock);
    await api.create({ title: 'Công việc', description: 'Mô tả' });
    expect(fetchMock).toHaveBeenCalledWith('/api/issues', expect.objectContaining({ method: 'POST', body: JSON.stringify({ title: 'Công việc', description: 'Mô tả' }) }));
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ issue: { id: 1, status: 'done' } })));
    await api.updateStatus(1, 'done');
    expect(fetchMock).toHaveBeenLastCalledWith('/api/issues/1/status', expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'done' }) }));
  });

  it('surfaces the backend validation message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'INVALID_TITLE', message: 'Tiêu đề không hợp lệ.' } }), { status: 400 })));
    await expect(api.create({ title: '', description: '' })).rejects.toThrow('Tiêu đề không hợp lệ.');
  });

  it('reports network failures and non-JSON proxy errors in Vietnamese', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.list()).rejects.toThrow('Không thể kết nối API.');
    fetchMock.mockResolvedValue(new Response('proxy unavailable', { status: 503 }));
    await expect(api.list()).rejects.toThrow('Không thể kết nối API.');
  });

  it('preserves abort errors so stale requests are ignored', async () => {
    const error = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    await expect(api.list(new AbortController().signal)).rejects.toBe(error);
  });
});
