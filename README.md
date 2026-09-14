# Multi-Agent Orchestration Lab · Mini Issue Tracker

Lab 00 xây nền quản lý phiếu công việc/lỗi chạy local: tạo phiếu, xem danh sách/chi tiết, đổi trạng thái **Mới, Đang làm, Hoàn thành**, xem thời gian tạo/cập nhật. SQLite giữ dữ liệu sau reload và restart backend. GitHub quản lý quá trình phát triển; ứng dụng không gọi GitHub API. Lab 01 dành cho Antigravity hoàn thiện UI/UX.

## Chạy trên máy

Yêu cầu **Node.js 24.15.0 hoặc mới hơn trong nhánh 24**, **npm 11**, Git. `.nvmrc` ghi phiên bản đã kiểm tra. Không cần SQLite CLI hoặc database server. Dùng npm và giữ `package-lock.json`.

Chạy từ **root repository**:

```sh
npm ci
npm run db:init
npm run db:seed
npm run dev
```

- Frontend: **http://127.0.0.1:5173/**
- API: **http://127.0.0.1:3001/api/health**
- Dừng hai dịch vụ bằng `Ctrl+C`.

`db:seed` tùy chọn: thêm 3 mẫu lần đầu, chạy lại không sửa/xóa dữ liệu có sẵn. Backend tự tạo schema nhưng không tự seed. Database `data/issues.sqlite` được Git ignore và còn sau restart.

`.env` không bắt buộc. Sao chép `.env.example` thành `.env` nếu cần đổi `PORT` hoặc `DATABASE_PATH`; đường dẫn tương đối tính từ root. Vite đọc cùng PORT cho proxy. Restart hai dịch vụ sau khi đổi cấu hình. Log “.env not found. Continuing without it.” là bình thường khi dùng mặc định.

## Tự nghiệm thu

1. Mở frontend, nhập tiêu đề/mô tả và bấm **Tạo phiếu mới**.
2. Chọn phiếu trong danh sách; kiểm tra chi tiết, thời gian và trạng thái Mới.
3. Chọn Đang làm rồi Hoàn thành; status được lưu ngay, updatedAt thay đổi.
4. Reload. Dừng `npm run dev`, chạy lại; phiếu vẫn còn.
5. Thử tiêu đề chỉ trắng: form phải báo lỗi.
6. Kiểm tra API lỗi bằng hai terminal: `npm run dev:api` và `npm run dev:web`. Dừng API, thử tạo/đổi status/tải lại list: UI báo lỗi, giữ form khi gửi thất bại. Chạy lại API và bấm **Thử lại**.
7. Thử màn hình điện thoại: form/list/detail xếp một cột, có thể cuộn để thao tác.

## Kiểm tra và bản build local

```sh
npm run verify
```

Verify chạy nối tiếp **typecheck → ESLint → Vitest → build backend/frontend**, dừng khi bất kỳ bước nào thất bại. API tests dùng SQLite riêng trong OS temp, không chạm database local. UI unit mocks chỉ nằm trong tests; browser check dùng API/database thật.

Lệnh riêng: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. GitHub Actions chạy npm ci/verify trên **Ubuntu và Windows** khi PR/push. Bằng chứng tại [docs/VERIFICATION.md](docs/VERIFICATION.md) và [issue #4](https://github.com/NhanDuong21/multi-agent-orchestration/issues/4).

Dừng dev, rồi chạy bản build local:

```sh
npm run build
npm start
```

Backend phục vụ API và frontend build tại **http://127.0.0.1:3001/**, vẫn dùng cùng database. Chưa có deployment.

## Cấu trúc và công nghệ

| Nguồn | Nội dung |
| --- | --- |
| `apps/web/src` | React, API client thật, form/list/detail/status, Tailwind |
| `apps/server/src` | Express, validation, SQLite, server/database CLI |
| `packages/shared/src/index.ts` | Type phiếu/status/request/response, nhãn và giới hạn |
| `apps/server/test`, `apps/web/test` | API SQLite và UI/client tests |
| `.github/workflows/verify.yml` | CI trên PR/push |
| [docs/API.md](docs/API.md) | Contract thật |
| [docs/LAB-00.md](docs/LAB-00.md) | Phạm vi/tiêu chí nền |
| [AGENTS.md](AGENTS.md) | Nhận việc/kiểm chứng/bàn giao |
| [docs/HANDOFF.md](docs/HANDOFF.md) | Bản nền và nhận việc Antigravity |
| [docs/REVIEW.md](docs/REVIEW.md) | Review độc lập, phát hiện và xử lý |

React + Vite + TypeScript; Node.js + Express + TypeScript; SQLite qua node:sqlite; Tailwind CSS qua Vite plugin. npm workspace quản lý dependencies, root scripts giữ đường dẫn dữ liệu nhất quán. TypeScript 5.9 nằm trong dải hỗ trợ thực tế của typescript-eslint; lockfile ghi các phiên bản đã kiểm chứng.

## GitHub và chuyển agent

Project cá nhân **[Multi-Agent Orchestration Lab](https://github.com/users/NhanDuong21/projects/7)**, owner NhanDuong21, repository NhanDuong21/multi-agent-orchestration. Board: **Backlog, Ready, In Progress, In Review, Done**.

| Issue | Vai trò |
| --- | --- |
| [#1 · Nền/lệnh local](https://github.com/NhanDuong21/multi-agent-orchestration/issues/1) | agent:codex · lab:00 |
| [#2 · API/SQLite](https://github.com/NhanDuong21/multi-agent-orchestration/issues/2) | agent:codex · lab:00 |
| [#3 · Frontend/API thật](https://github.com/NhanDuong21/multi-agent-orchestration/issues/3) | agent:codex · lab:00 |
| [#4 · Kiểm chứng/CI](https://github.com/NhanDuong21/multi-agent-orchestration/issues/4) | agent:codex · lab:00 |
| [#5 · Review/bàn giao](https://github.com/NhanDuong21/multi-agent-orchestration/issues/5) | agent:codex-review · lab:00 |
| [#6 · Antigravity UI/UX](https://github.com/NhanDuong21/multi-agent-orchestration/issues/6) | agent:antigravity · lab:01 |
| [#7 · Review/tích hợp UI](https://github.com/NhanDuong21/multi-agent-orchestration/issues/7) | agent:codex-review · lab:01 |

Assignee NhanDuong21 là người chịu trách nhiệm thật; labels/issue xác định agent. Đọc yêu cầu/dependencies/comment, ghi phiên/vai trò/branch và In Progress trước khi nhận. Chờ review/merge giữ In Review; chỉ Done/đóng sau nghiệm thu và quy trình chấp nhận. Chưa tự merge PR Lab 00.

Bản nền bàn giao tại **[PR #8](https://github.com/NhanDuong21/multi-agent-orchestration/pull/8)**, branch `nyan/lab-00-mini-issue-tracker`. #1–#5 In Review, #6/#7 Backlog; người dùng nghiệm thu trước merge. Xem [bằng chứng local/browser/CI](docs/VERIFICATION.md) và [review độc lập](docs/REVIEW.md).

Sau nghiệm thu/merge nền, mở Antigravity và đưa **[issue #6](https://github.com/NhanDuong21/multi-agent-orchestration/issues/6)** cùng HANDOFF.md. Label không tự chạy Antigravity. #6 chỉ đổi frontend; ghi nhu cầu backend để Codex xử lý. Codex tiếp tục #7 sau bàn giao UI.

GitHub integration đọc được repo nhưng tạo issue trả 403; issues/comments dùng gh. Projects dùng phiên GitHub UI đã đăng nhập. Agent dùng CLI Projects cần kiểm tra gh auth status; nếu thiếu quyền, dùng `gh auth refresh -h github.com -s project` và người dùng xác nhận trên GitHub, không gửi token vào chat.
