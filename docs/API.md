# Contract API · Lab 00

API dev http://127.0.0.1:3001; frontend gọi /api qua Vite proxy. Nguồn: packages/shared/src/index.ts (type/nhãn/giới hạn), apps/server/src/app.ts (routes/validation), database.ts (SQLite), apps/web/src/api.ts (client thật).

```ts
interface Issue {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done';
  createdAt: string;
  updatedAt: string;
}
```

ID nguyên dương, không bảo đảm liên tục. Thời gian ISO UTC; UI hiển thị vi-VN theo múi giờ browser. open = Mới, in_progress = Đang làm, done = Hoàn thành.

| Method/path | JSON input | Response |
| --- | --- | --- |
| GET /api/health | — | 200 { status: "ok" } |
| GET /api/issues | — | 200 { issues: Issue[] }, ID mới nhất trước |
| POST /api/issues | { title: string, description?: string } | 201 { issue: Issue }, Location header |
| GET /api/issues/:id | — | 200 { issue: Issue } |
| PATCH /api/issues/:id/status | { status: IssueStatus } | 200 { issue: Issue } |

Title trim, bắt buộc 1–160 ký tự, từ chối rỗng/trắng/kiểu sai. Description mặc định chuỗi rỗng khi bỏ qua, phải là string tối đa 4000 ký tự; null không hợp lệ. Validation dùng độ dài chuỗi JavaScript. Phiếu mới luôn open; nếu POST gửi status thì chỉ open được chấp nhận. Không có sửa title/description hoặc xóa phiếu trong Lab 00.

Đổi status giữ id/title/description/createdAt; updatedAt tăng khi status thay đổi. Gửi lại status cũ không đổi updatedAt. ID sai định dạng hoặc không tồn tại trả 404. SQL có tham số, schema CHECK.

Lỗi dạng `{ error: { code: string, message: string, field?: string } }`, message tiếng Việt. 400: input/body/JSON sai; 404: phiếu/route thiếu; 413: request vượt 32 KB; 500: lỗi nội bộ, không lộ chi tiết ra response. API dùng Cache-Control: no-store.

Client báo lỗi kết nối nếu fetch thất bại hoặc proxy lỗi không phải JSON. Form giữ dữ liệu khi tạo thất bại; status giữ giá trị đã lưu khi patch lỗi; list/detail có retry. Không cập nhật dữ liệu trước response thành công.

Database mặc định data/issues.sqlite; DATABASE_PATH đổi qua .env. Chạy từ root. Schema tạo không phá dữ liệu. Seed dùng seed_key riêng với ON CONFLICT DO NOTHING, giữ phiếu người dùng và status mẫu đã đổi. seed_key chỉ nội bộ, không nằm trong API response.
