# Bằng chứng kiểm chứng Lab 00

2026-09-14, Windows, Node 24.15.0, npm 11.12.1; branch nyan/lab-00-mini-issue-tracker. Đây là kết quả đã chạy, không thay checklist chấp nhận của người dùng.

## Local

- npm install và clean install npm ci thành công, audit 0 vulnerabilities, lockfile tái lập được dependencies.
- db:init pass; db:seed thêm 3 lần đầu, 0 lần hai, giữ dữ liệu.
- npm run dev chạy API 3001/Vite 5173. Đã restart Vite sau thay dependencies trước browser check.
- npm run verify **pass**: typecheck, ESLint, **56 tests / 3 files** (44 API, 8 UI, 4 HTTP client), build backend/frontend. Năm ca mới kiểm tra URL encoding hỏng và title NUL sau review độc lập.
- Sau clean install npm ci, verify pass lại đủ các bước với 51 tests trước review; sau sửa review, verify pass 56 tests. npm start chạy bản biên dịch; browser tại 127.0.0.1:3001 hiển thị frontend, list/detail và phiếu #7 Hoàn thành từ cùng database.
- API tests: SQLite file riêng dưới OS temp mini-issue-test-*, cleanup đúng thư mục test. Có create/default/trim, giới hạn/kiểu input, title trắng, status sai, ID thiếu/sai, timestamps/persistence qua app/kết nối mới, seed idempotent, lỗi API.
- UI/client tests: loading/empty, whitespace, create/detail/status, lỗi giữ form/status, retry, detail thiếu, bỏ response cũ, HTTP/network/abort. Mocks chỉ trong unit tests.

## Browser thật

Codex in-app browser tại frontend 127.0.0.1:5173, API thật 127.0.0.1:3001, SQLite local:

1. Đọc 3 mẫu đã seed qua API.
2. Tạo title `  Kiểm chứng browser Lab 00  ` và mô tả hai dòng: phiếu **#7**, title trim, status Mới; list/detail đúng, form xóa sau thành công.
3. Đổi Đang làm, reload: dữ liệu/status còn. Đổi Hoàn thành; chọn mẫu khác rồi #7: detail đúng.
4. Override viewport **375 × 812**: một cột; DOM contentWidth = viewportWidth = 360 (15px scrollbar), không tràn ngang. Đổi Mới → Hoàn thành trên mobile pass. Đã reset override.
5. Dừng API Ctrl+C, không còn listener 3001, Vite còn chạy. Tạo thất bại: lỗi tiếng Việt, giữ title/description. Patch thất bại: status đã lưu vẫn Hoàn thành. Tải lại list/detail: error/retry, tổng quan `—`.
6. Chạy dev:api bằng process mới; Thử lại phục hồi. #7 vẫn Hoàn thành, cùng timestamps trước restart. Reload tiếp: dữ liệu còn. Draft thử lỗi được xóa bằng UI, không tạo thêm phiếu.
7. Sau sửa review/build, dừng production và chạy lại npm run dev từ root. Browser tại 127.0.0.1:5173 đọc bốn phiếu, chi tiết #7 vẫn Hoàn thành và giữ timestamps. Hai dịch vụ được để chạy để người dùng nghiệm thu.

Browser không mock. Dữ liệu runtime đã ignore, không commit.

## GitHub Project

Đã tìm cả Project mở/đóng theo tên trước khi tạo, không có trùng. Phiên GitHub UI đã đăng nhập tạo [Project cá nhân #7](https://github.com/users/NhanDuong21/projects/7) và Board Lab Board; nhập đúng bảy GitHub Issues thật, không dùng draft thay issue. Repository Projects liệt kê đúng Multi-Agent Orchestration Lab #7. Reload Board sau review xác nhận **Backlog (#6/#7), Ready (0), In Progress (0), In Review (#1–#5), Done (0)**. Labels/vai trò và assignee NhanDuong21 đã kiểm tra bằng gh issue/label list. Checklist kỹ thuật #1–#5 đã đánh dấu theo bằng chứng; checklist nghiệm thu/merge của người dùng còn mở. Không đóng issue hoặc merge PR.

GitHub integration đọc được repository/issues nhưng create issue/PR bị 403; gh tạo issues/labels/comments/PR thành công. CLI thiếu scope project; luồng device OAuth hết hạn, Projects đã hoàn tất qua UI nên không chặn thiết lập này.

## CI và review

Workflow verify.yml chạy npm ci/verify trên Ubuntu/Windows cho PR/push. Bản code sau review **317d3dab5733941d876f8e3e39e34f65639b9772** có cả hai matrix jobs thành công ở:

- [Push run 34868248046](https://github.com/NhanDuong21/multi-agent-orchestration/actions/runs/34868248046): completed/success, Ubuntu và Windows.
- [PR run 34868280069](https://github.com/NhanDuong21/multi-agent-orchestration/actions/runs/34868280069): completed/success, Ubuntu và Windows.

Commit nền 57db7b6 cũng có [push CI thành công](https://github.com/NhanDuong21/multi-agent-orchestration/actions/runs/34867954935) với 51 tests trước thêm hồi quy. Các link trên gắn với SHA cụ thể; CI cho commit tài liệu bàn giao tiếp theo được xác minh tại [PR #8 Checks](https://github.com/NhanDuong21/multi-agent-orchestration/pull/8/checks) và comment cuối [issue #4](https://github.com/NhanDuong21/multi-agent-orchestration/issues/4). Kết quả local và CI là các lượt chạy riêng.

**Review độc lập đã hoàn tất** bởi subagent riêng. Hai findings P3 đã sửa; reviewer review lại diff và tự chạy 44/44 API tests pass, không có finding mới. [REVIEW.md](REVIEW.md) ghi bằng chứng và giới hạn: browser/clean install/build/CI do agent chính thực hiện. [PR #8](https://github.com/NhanDuong21/multi-agent-orchestration/pull/8) mở vào main, chờ người dùng nghiệm thu/merge. Lab 01 chưa triển khai.
