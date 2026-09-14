# Bằng chứng kiểm chứng Lab 00

2026-09-14, Windows, Node 24.15.0, npm 11.12.1; branch nyan/lab-00-mini-issue-tracker. Đây là kết quả đã chạy, không thay checklist chấp nhận của người dùng.

## Local

- npm install và clean install npm ci thành công, audit 0 vulnerabilities, lockfile tái lập được dependencies.
- db:init pass; db:seed thêm 3 lần đầu, 0 lần hai, giữ dữ liệu.
- npm run dev chạy API 3001/Vite 5173. Đã restart Vite sau thay dependencies trước browser check.
- npm run verify **pass**: typecheck, ESLint, **51 tests / 3 files**, build backend/frontend.
- Sau clean install npm ci, verify pass lại đủ các bước. npm start chạy bản biên dịch; browser tại 127.0.0.1:3001 hiển thị frontend, list/detail và phiếu #7 Hoàn thành từ cùng database.
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

Browser không mock. Dữ liệu runtime đã ignore, không commit.

## GitHub Project

Đã tìm cả Project mở/đóng theo tên trước khi tạo, không có trùng. Phiên GitHub UI đã đăng nhập tạo Project cá nhân #7 và Board Lab Board; nhập đúng bảy GitHub Issues thật, không dùng draft thay issue. Repository Projects liệt kê đúng Multi-Agent Orchestration Lab #7. Reload Board xác nhận Backlog (#6/#7), Ready (0), In Progress (#5 khi đang review), In Review (#1–#4), Done (0). Labels/vai trò và assignee NhanDuong21 đã kiểm tra bằng gh issue/label list. Trạng thái cuối chờ người dùng sẽ cập nhật sau PR.

GitHub integration đọc được repository/issues nhưng create issue bị 403; gh tạo issues/labels/comments thành công. CLI thiếu scope project; luồng device OAuth hết hạn, Projects đã hoàn tất qua UI nên không chặn thiết lập này.

## CI và review

Workflow verify.yml chạy npm ci/verify trên Ubuntu/Windows cho PR/push. **CI chưa có kết quả tại mốc này**; cập nhật sau push tại đây và issue #4.

**Review độc lập đang thực hiện** bởi subagent riêng; kết quả cuối ghi docs/REVIEW.md và issue #5 sau khi subagent trả findings.
