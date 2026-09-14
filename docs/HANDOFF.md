# Bàn giao nền và nhận việc Antigravity

Project: [Multi-Agent Orchestration Lab](https://github.com/users/NhanDuong21/projects/7). #1–#5 là nền; [#6 · Antigravity](https://github.com/NhanDuong21/multi-agent-orchestration/issues/6); [#7 · Review UI](https://github.com/NhanDuong21/multi-agent-orchestration/issues/7).

## Bản nền

Branch nyan/lab-00-mini-issue-tracker, base main tại 168eaef. PR/commit cập nhật sau review/push. Lab 00 chờ nghiệm thu/merge In Review, issues mở. Lab 01 Backlog.

API thật, SQLite bền vững, seed idempotent, type chung, frontend tiếng Việt đủ chức năng/loading/empty/error/retry, responsive cơ bản. Đọc API.md, VERIFICATION.md, README/AGENTS. Root: npm ci, db:init, seed tùy chọn, npm run dev (frontend 5173/API 3001), npm run verify.

Project/labels/7 issues đã tạo và xác minh: trang Projects của repository liệt kê đúng Project #7; Board có đủ bảy issues và năm cột đúng thứ tự. Projects dùng phiên UI GitHub đã xác thực vì CLI thiếu scope project; không gửi token vào chat. Agent chính cập nhật GitHub, subagent review chỉ đọc.

## Điều kiện nhận Lab 01

1. NhanDuong21 dùng thử, đọc PR/bằng chứng, chấp nhận và merge nền.
2. Hoàn tất checklist #1–#5, đóng/chuyển Done; chuyển #6 Ready.
3. Mở Antigravity, đưa link #6. Agent đọc repo/AGENTS/issue/dependencies/comment; ghi phiên/branch và In Progress.

## Nguồn frontend và ranh giới

- apps/web/src/App.tsx: list/detail/state/luồng client.
- components/CreateIssueForm.tsx: form, validation và lỗi gửi; StatusBadge.tsx và styles.css: UI/Tailwind cơ bản.
- apps/web/src/api.ts: HTTP client thật, đọc trước khi đổi tương tác.
- packages/shared/src/index.ts: Issue/IssueStatus/request/response/giới hạn.
- apps/server/src/app.ts và docs/API.md: đối chiếu contract, không sửa backend/schema trong issue UI.

Antigravity cải thiện bố cục, typography, khoảng cách, tương tác, responsive/accessibility. Giữ API/persistence/error, không fake data/auto seed/auth/deploy. Cần backend: ghi lý do và ví dụ request/response mong muốn trong #6 để Codex xử lý.

## Prompt đưa cho Antigravity

> Nhận https://github.com/NhanDuong21/multi-agent-orchestration/issues/6 sau khi nền Lab 00 đã nghiệm thu/merge. Đọc AGENTS.md, issue/dependencies, docs/HANDOFF.md và nguồn API/type thật. Ghi phiên/vai trò/feature branch và In Progress trước khi nhận. Chỉ hoàn thiện frontend UI/UX, giữ API thật; ghi nhu cầu backend để Codex xử lý. Chạy npm run verify và browser checks; bàn giao ảnh trước/sau desktop/mobile, branch/commit/PR, lệnh/kết quả thật, findings/phần còn lại. Giữ In Review, chưa tự merge.

Sau bàn giao UI, Codex nhận #7 review diff/contract/hồi quy/browser/verify/CI; NhanDuong21 chấp nhận trước merge/Done.
