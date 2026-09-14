# Quy tắc làm việc

- Đọc README, issue, dependencies và comment mới nhất; kiểm tra git status/branch/remote. Giữ thay đổi chưa commit của người khác.
- Issues là nguồn yêu cầu/bằng chứng; [Project](https://github.com/users/NhanDuong21/projects/7) hiển thị tiến độ. Không tạo trùng. Agent chính là đầu mối GitHub; subagent review không ghi trạng thái/comment.
- Trước khi nhận, kiểm tra không có agent giữ việc, ghi phiên/vai trò/branch trong issue và In Progress. Branch mặc định nyan/..., assignee là tài khoản thật, label xác định vai trò.
- Bám tiêu chí issue, docs/API.md và packages/shared/src/index.ts. Issue Antigravity chỉ đổi frontend; nhu cầu backend ghi trong issue cho agent xử lý backend. Mock chỉ trong unit test, không dùng trong ứng dụng chạy thật.
- Chạy lệnh từ root. Không commit secrets/.env/database/runtime/artifacts. Không xóa/reset database người dùng; seed idempotent, test dùng DB riêng.
- Chạy npm run verify và browser check luồng bị ảnh hưởng. Không bỏ/giảm kiểm tra để pass. Ghi lệnh/kết quả thật, phần chưa chạy và nguyên nhân; phân biệt local với CI.
- Cập nhật issue ở mốc bắt đầu, blocker, bàn giao. Blocker có nguyên nhân/điều kiện tiếp tục và label blocked; gỡ khi giải quyết. Không bình luận từng lệnh.
- Bàn giao: thay đổi, branch/commit/PR, kiểm chứng/bằng chứng, findings/phần còn lại, việc tiếp theo. Review độc lập phải thực sự do phiên riêng. Chờ review/merge giữ In Review; Done/đóng sau nghiệm thu và quy trình chấp nhận. Chưa tự merge nếu người dùng chưa cho phép.
- Cập nhật README/docs đúng code để phiên/công cụ mới tiếp tục được từ repo/GitHub.
