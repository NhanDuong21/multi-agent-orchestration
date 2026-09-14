# Review độc lập Lab 00

Ngày 2026-09-14, một subagent riêng `/root/lab00_independent_review` đọc yêu cầu gốc, AGENTS.md, diff/nội dung ứng dụng, tests, cấu hình, lockfile, tài liệu và bảy issues GitHub. Agent chính là đầu mối ghi GitHub; reviewer không sửa file hoặc thao tác database local/browser/GitHub.

## Phát hiện và xử lý

| Mức | Bằng chứng ban đầu | Sửa và kiểm chứng |
| --- | --- | --- |
| P3 | GET `/api/issues/%` hoặc `/api/issues/%E0%A4%A` gây URIError và trả 500 | Error handler trả 400 `INVALID_URL`; hai API tests hồi quy |
| P3 | POST title chứa NUL có thể qua JavaScript validation nhưng thất bại SQLite CHECK, trả 500 | Reject NUL trước SQLite, trả 400 `INVALID_TITLE`; ba API tests hồi quy |

`apps/server/src/app.ts` và `docs/API.md` khớp contract đã sửa. Reviewer tự chạy API suite ban đầu 39/39, xác minh edge cases bằng database tạm trong bộ nhớ, rồi review lại ba file sửa và tự chạy `npm test -- apps/server/test/api.test.ts`: **44/44 pass**, gồm năm ca hồi quy. Reviewer xác nhận hai findings đã xử lý, không thấy vấn đề mới và không có blocker ở luồng Lab 00.

Agent chính chạy lại `npm run verify` sau sửa: **56/56 tests / 3 files**, typecheck, ESLint và build backend/frontend đều pass. Browser thật, clean install, production build và CI do agent chính kiểm chứng; reviewer không chạy độc lập những phần đó. Bằng chứng riêng tại [VERIFICATION.md](VERIFICATION.md).

Review kỹ thuật hoàn tất; PR vẫn chờ NhanDuong21 dùng thử, nghiệm thu và merge. Giữ #1–#5 mở/In Review; chưa thực hiện phần UI/UX Lab 01.
