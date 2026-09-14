import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Issue } from '../../../packages/shared/src/index.js';
import { createApp } from '../src/app.js';
import { IssueStore } from '../src/database.js';

let directory: string;
let path: string;
let store: IssueStore;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'mini-issue-test-'));
  path = join(directory, 'test.sqlite');
  store = new IssueStore(path);
  app = createApp(store);
});

afterEach(() => {
  store.close();
  // Only remove the directory created by this test, never the local database.
  if (dirname(resolve(directory)) !== resolve(tmpdir()) || !basename(directory).startsWith('mini-issue-test-')) {
    throw new Error('Unsafe test cleanup path');
  }
  rmSync(directory, { recursive: true, force: true });
});

async function create(): Promise<Issue> {
  const response = await request(app).post('/api/issues').send({ title: '  Phiếu kiểm tra  ', description: 'Dòng 1\nDòng 2' }).expect(201);
  return response.body.issue as Issue;
}

describe('Issue API with isolated, real SQLite', () => {
  it('starts healthy and empty without automatic seed', async () => {
    await request(app).get('/api/health').expect(200, { status: 'ok' });
    await request(app).get('/api/issues').expect(200, { issues: [] });
  });

  it('creates, trims a valid title, defaults open, lists and reads the same data', async () => {
    const issue = await create();
    expect(issue).toMatchObject({ id: 1, title: 'Phiếu kiểm tra', description: 'Dòng 1\nDòng 2', status: 'open' });
    expect(new Date(issue.createdAt).toISOString()).toBe(issue.createdAt);
    expect(issue.updatedAt).toBe(issue.createdAt);
    const list = await request(app).get('/api/issues').expect(200);
    expect(list.body).toEqual({ issues: [issue] });
    expect(list.headers['cache-control']).toBe('no-store');
    await request(app).get(`/api/issues/${issue.id}`).expect(200, { issue });
  });

  it.each(['', '   ', '\t\n', '\u00a0', '\0', '\0abc', 'abc\0', null, undefined, 123, 'x'.repeat(161)])('rejects an invalid title: %j', async title => {
    const response = await request(app).post('/api/issues').send({ title }).expect(400);
    expect(response.body.error.code).toBe('INVALID_TITLE');
    expect(store.list()).toEqual([]);
  });

  it.each([null, 12, [], {}, 'x'.repeat(4001)])('rejects an invalid description: %j', async description => {
    await request(app).post('/api/issues').send({ title: 'Hợp lệ', description }).expect(400);
    expect(store.list()).toEqual([]);
  });

  it('accepts the maximum lengths and an omitted description', async () => {
    await request(app).post('/api/issues').send({ title: 'x'.repeat(160), description: 'x'.repeat(4000) }).expect(201);
    const response = await request(app).post('/api/issues').send({ title: 'Không có mô tả' }).expect(201);
    expect(response.body.issue.description).toBe('');
  });

  it.each(['invalid', 'in_progress', null, 123])('does not allow a new issue to override open with %j', async status => {
    await request(app).post('/api/issues').send({ title: 'Phiếu mới', status }).expect(400);
    expect(store.list()).toHaveLength(0);
  });

  it.each(['999', 'abc', '0', '-1', '1.5', '9007199254740992'])('returns 404 for absent or malformed ID %s', async id => {
    const get = await request(app).get(`/api/issues/${id}`).expect(404);
    expect(get.body.error.code).toBe('ISSUE_NOT_FOUND');
    await request(app).patch(`/api/issues/${id}/status`).send({ status: 'done' }).expect(404);
  });

  it.each(['unknown', 'OPEN', '', null, 12, {}, undefined])('rejects invalid status %j without changing data', async status => {
    const original = await create();
    const response = await request(app).patch(`/api/issues/${original.id}/status`).send({ status }).expect(400);
    expect(response.body.error.code).toBe('INVALID_STATUS');
    expect(store.find(original.id)).toEqual(original);
  });

  it('updates every status, preserves creation time and persists through a new app/connection', async () => {
    const original = await create();
    let latest = original;
    for (const status of ['in_progress', 'done', 'open'] as const) {
      const response = await request(app).patch(`/api/issues/${original.id}/status`).send({ status }).expect(200);
      const updated = response.body.issue as Issue;
      expect(updated).toMatchObject({ ...original, status, updatedAt: expect.any(String) });
      expect(Date.parse(updated.updatedAt)).toBeGreaterThan(Date.parse(latest.updatedAt));
      latest = updated;
    }
    store.close();
    store = new IssueStore(path);
    app = createApp(store);
    await request(app).get(`/api/issues/${original.id}`).expect(200, { issue: latest });
    await request(app).get('/api/issues').expect(200, { issues: [latest] });
  });

  it('keeps updatedAt unchanged when the status is unchanged', async () => {
    const original = await create();
    await request(app).patch(`/api/issues/${original.id}/status`).send({ status: 'open' }).expect(200, { issue: original });
  });

  it('seeds once, preserving an edited sample and a user issue with the same title', async () => {
    const userIssue = store.create({ title: 'Thử tạo một phiếu mới', description: 'Dữ liệu người dùng' });
    expect(store.seed()).toBe(3);
    const sample = store.list().find(issue => issue.id !== userIssue.id && issue.title === userIssue.title)!;
    const edited = store.updateStatus(sample.id, 'done');
    expect(store.seed()).toBe(0);
    expect(store.list()).toHaveLength(4);
    expect(store.find(userIssue.id)).toEqual(userIssue);
    expect(store.find(sample.id)).toEqual(edited);
    store.close();
    store = new IssueStore(path);
    expect(store.seed()).toBe(0);
    expect(store.find(sample.id)).toEqual(edited);
  });

  it('stores SQL-looking text as plain data', async () => {
    const title = "'); DROP TABLE issues; --";
    await request(app).post('/api/issues').send({ title }).expect(201);
    expect(store.list()[0]?.title).toBe(title);
    await create();
    expect(store.list()).toHaveLength(2);
  });

  it('rejects malformed/non-object JSON, large bodies and unknown routes', async () => {
    const invalid = await request(app).post('/api/issues').set('Content-Type', 'application/json').send('{').expect(400);
    expect(invalid.body.error.code).toBe('INVALID_JSON');
    await request(app).post('/api/issues').send([]).expect(400);
    const large = await request(app).post('/api/issues').send({ title: 'x', description: 'x'.repeat(40000) }).expect(413);
    expect(large.body.error.code).toBe('BODY_TOO_LARGE');
    await request(app).get('/api/unknown').expect(404);
  });

  it('returns a safe JSON 500 error when the store fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(store, 'list').mockImplementation(() => { throw new Error('private failure details'); });
    const response = await request(app).get('/api/issues').expect(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(response.body)).not.toContain('private failure details');
  });

  it.each(['%', '%E0%A4%A'])('returns 400 rather than 500 for invalid URL encoding %s', async id => {
    const response = await request(app).get(`/api/issues/${id}`).expect(400);
    expect(response.body.error.code).toBe('INVALID_URL');
    expect(store.list()).toEqual([]);
  });
});
