# Bàn giao nền và nhận việc Antigravity

Project: [Multi-Agent Orchestration Lab](https://github.com/users/NhanDuong21/projects/7). #1–#5 là nền; [#6 · Antigravity](https://github.com/NhanDuong21/multi-agent-orchestration/issues/6); [#7 · Review UI](https://github.com/NhanDuong21/multi-agent-orchestration/issues/7).

## Bản nền

Branch `nyan/lab-00-mini-issue-tracker`, base main tại 168eaef. **[PR #8](https://github.com/NhanDuong21/multi-agent-orchestration/pull/8)** mở vào main, chưa merge. Commit triển khai [57db7b6](https://github.com/NhanDuong21/multi-agent-orchestration/commit/57db7b63a89e36fa8bc7e28a78493a274d2d4c93), sửa review [317d3da](https://github.com/NhanDuong21/multi-agent-orchestration/commit/317d3dab5733941d876f8e3e39e34f65639b9772); commit tài liệu tổng hợp xem HEAD của PR và comment bàn giao #5. #1–#5 chờ nghiệm thu/merge ở In Review và mở; #6/#7 Backlog.

API thật, SQLite bền vững, seed idempotent, type chung, frontend tiếng Việt đủ chức năng/loading/empty/error/retry, responsive cơ bản. Đọc API.md, VERIFICATION.md, REVIEW.md, README/AGENTS. Root: npm ci, npm run db:init, npm run db:seed tùy chọn, npm run dev (frontend 5173/API 3001), npm run verify. Verify sau sửa pass 56 tests/typecheck/lint/build; browser API thật kiểm tra cả restart/outage/mobile. Review độc lập đã xử lý hai findings input và kiểm tra lại; CI push/PR của commit code sau review pass Ubuntu/Windows. CI HEAD mới nhất xem PR Checks và #4.

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
