import { existsSync } from 'node:fs';
import { join } from 'node:path';
import express, { type ErrorRequestHandler, type Response } from 'express';
import {
  DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, isIssueStatus,
  type ApiErrorResponse
} from '../../../packages/shared/src/index.js';
import { IssueStore } from './database.js';

function fail(res: Response, status: number, code: string, message: string, field?: string): void {
  const body: ApiErrorResponse = { error: { code, message, ...(field ? { field } : {}) } };
  res.status(status).json(body);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function issueId(value: string | string[] | undefined): number | undefined {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : undefined;
}

export function createApp(store: IssueStore, webDirectory?: string) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/issues', (_req, res) => res.json({ issues: store.list() }));

  app.post('/api/issues', (req, res) => {
    const body: unknown = req.body;
    if (!record(body)) { fail(res, 400, 'INVALID_BODY', 'Nội dung yêu cầu phải là một đối tượng JSON.'); return; }
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > TITLE_MAX_LENGTH) {
      fail(res, 400, 'INVALID_TITLE', `Tiêu đề phải có từ 1 đến ${TITLE_MAX_LENGTH} ký tự, không chỉ có khoảng trắng.`, 'title'); return;
    }
    const description = body.description === undefined ? '' : body.description;
    if (typeof description !== 'string' || description.length > DESCRIPTION_MAX_LENGTH) {
      fail(res, 400, 'INVALID_DESCRIPTION', `Mô tả phải là văn bản, tối đa ${DESCRIPTION_MAX_LENGTH} ký tự.`, 'description'); return;
    }
    if ('status' in body && body.status !== 'open') {
      fail(res, 400, 'INVALID_STATUS', 'Phiếu mới phải có trạng thái Mới (open).', 'status'); return;
    }
    const issue = store.create({ title: body.title.trim(), description });
    res.location(`/api/issues/${issue.id}`).status(201).json({ issue });
  });

  app.get('/api/issues/:id', (req, res) => {
    const id = issueId(req.params.id);
    const issue = id === undefined ? undefined : store.find(id);
    if (!issue) { fail(res, 404, 'ISSUE_NOT_FOUND', 'Không tìm thấy phiếu này.'); return; }
    res.json({ issue });
  });

  app.patch('/api/issues/:id/status', (req, res) => {
    const id = issueId(req.params.id);
    if (id === undefined || !store.find(id)) { fail(res, 404, 'ISSUE_NOT_FOUND', 'Không tìm thấy phiếu này.'); return; }
    const body: unknown = req.body;
    if (!record(body) || !isIssueStatus(body.status)) {
      fail(res, 400, 'INVALID_STATUS', 'Trạng thái phải là open, in_progress hoặc done.', 'status'); return;
    }
    res.json({ issue: store.updateStatus(id, body.status) });
  });

  app.use('/api', (_req, res) => fail(res, 404, 'ROUTE_NOT_FOUND', 'Không tìm thấy API này.'));
  if (webDirectory && existsSync(join(webDirectory, 'index.html'))) {
    app.use(express.static(webDirectory));
    app.get('/', (_req, res) => res.sendFile(join(webDirectory, 'index.html')));
  }
  app.use((_req, res) => fail(res, 404, 'ROUTE_NOT_FOUND', 'Không tìm thấy trang này.'));

  const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
    if (res.headersSent) { next(error); return; }
    if (record(error) && error.type === 'entity.parse.failed') {
      fail(res, 400, 'INVALID_JSON', 'Nội dung JSON không hợp lệ.');
    } else if (record(error) && error.type === 'entity.too.large') {
      fail(res, 413, 'BODY_TOO_LARGE', 'Nội dung yêu cầu quá lớn.');
    } else {
      console.error('API error:', error);
      fail(res, 500, 'INTERNAL_ERROR', 'Không thể xử lý yêu cầu. Vui lòng thử lại.');
    }
  };
  app.use(errorHandler);
  return app;
}
