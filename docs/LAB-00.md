# Phạm vi và nghiệm thu Lab 00

React/Vite/TypeScript, Express/TypeScript, SQLite, Tailwind CSS; chạy local. GitHub quản lý phát triển, không là tính năng ứng dụng.

- Tạo title/description; mặc định open. List/detail/status open/in_progress/done; nhãn tiếng Việt; createdAt/updatedAt.
- Backend từ chối title rỗng/trắng, status sai, ID thiếu. Dữ liệu còn qua reload/restart; seed rõ ràng và an toàn khi chạy lại.
- UI có label/error form, loading/empty/error/retry, desktop/mobile đủ dùng. Giữ phần hoàn thiện UI/UX cho Antigravity Lab 01.
- Root commands npm ci, db:init, db:seed, dev, verify. Verify typecheck/lint/test/build thật; tests SQLite riêng. Browser create/list/detail/status/reload/restart/API offline; CI trên PR/push.
- Project cá nhân Multi-Agent Orchestration Lab, owner NhanDuong21, liên kết repo này. Ba labels vai trò, lab:00/lab:01/blocked; bảy issues thật trong Project.
- Issues có mục tiêu/phạm vi/checklist/dependencies bằng số thật/vai trò/bàn giao. Đọc và ghi phiên/branch trước nhận; milestones và bằng chứng ở issue. Agent chính ghi GitHub; subagent riêng review yêu cầu/diff/bằng chứng.
- README/AGENTS/handoff đúng code. Feature branch/commit/push/PR vào main, chưa merge. In Review khi chờ chấp nhận/merge; chỉ Done/đóng sau nghiệm thu. Lab 01 Backlog và phụ thuộc nền được chấp nhận.

Không thêm auth, multi-user, thanh toán, deployment, GitHub API trong ứng dụng hoặc thực hiện UI/UX Lab 01. Yêu cầu chi tiết và bằng chứng: issues #1–#7, links trong README.
