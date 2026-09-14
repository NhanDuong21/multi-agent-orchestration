import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { CreateIssueInput, Issue, IssueStatus } from '../../../packages/shared/src/index.js';

const columns = 'id, title, description, status, created_at AS createdAt, updated_at AS updatedAt';

export function databasePath(): string {
  return resolve(process.env.DATABASE_PATH || './data/issues.sqlite');
}

/** Small, synchronous SQLite store: one local user, no external service. */
export class IssueStore {
  private readonly db: DatabaseSync;

  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
    this.db = new DatabaseSync(path, { timeout: 5000 });
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 160),
        description TEXT NOT NULL DEFAULT '' CHECK(length(description) <= 4000),
        status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'done')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        seed_key TEXT UNIQUE
      ) STRICT;
    `);
  }

  list(): Issue[] {
    return this.db.prepare(`SELECT ${columns} FROM issues ORDER BY id DESC`).all() as unknown as Issue[];
  }

  find(id: number): Issue | undefined {
    return this.db.prepare(`SELECT ${columns} FROM issues WHERE id = ?`).get(id) as unknown as Issue | undefined;
  }

  create(input: CreateIssueInput): Issue {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      INSERT INTO issues (title, description, status, created_at, updated_at)
      VALUES (?, ?, 'open', ?, ?)
    `).run(input.title, input.description, now, now);
    return this.find(Number(result.lastInsertRowid))!;
  }

  updateStatus(id: number, status: IssueStatus): Issue | undefined {
    const issue = this.find(id);
    if (!issue || issue.status === status) return issue;
    const updatedAt = new Date(Math.max(Date.now(), Date.parse(issue.updatedAt) + 1)).toISOString();
    this.db.prepare('UPDATE issues SET status = ?, updated_at = ? WHERE id = ?').run(status, updatedAt, id);
    return this.find(id);
  }

  /** A stable seed key preserves edited samples and all user-created issues. */
  seed(): number {
    const samples: Array<CreateIssueInput & { key: string; status: IssueStatus }> = [
      { key: 'lab00-v1-welcome', title: 'Thử tạo một phiếu mới', description: 'Dùng form tạo phiếu, chọn phiếu trong danh sách và thử đổi trạng thái.', status: 'open' },
      { key: 'lab00-v1-persistence', title: 'Kiểm tra dữ liệu sau khi tải lại', description: 'Đổi trạng thái rồi tải lại trang. SQLite giữ dữ liệu cả khi khởi động lại backend.', status: 'in_progress' },
      { key: 'lab00-v1-handoff', title: 'Đọc hướng dẫn bàn giao giữa các agent', description: 'README và AGENTS.md ghi cách nhận issue, kiểm chứng và bàn giao công việc.', status: 'done' }
    ];
    const insert = this.db.prepare(`
      INSERT INTO issues (title, description, status, created_at, updated_at, seed_key)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(seed_key) DO NOTHING
    `);
    let added = 0;
    this.db.exec('BEGIN');
    try {
      for (const sample of samples) {
        const now = new Date().toISOString();
        added += Number(insert.run(sample.title, sample.description, sample.status, now, now, sample.key).changes);
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
    return added;
  }

  close(): void { this.db.close(); }
}
