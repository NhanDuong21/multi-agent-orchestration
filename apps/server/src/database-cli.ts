import { databasePath, IssueStore } from './database.js';

const command = process.argv[2];
if (command !== 'init' && command !== 'seed') throw new Error('Dùng npm run db:init hoặc npm run db:seed.');
const store = new IssueStore(databasePath());
try {
  console.log(`SQLite đã sẵn sàng: ${databasePath()}`);
  if (command === 'seed') console.log(`Đã thêm ${store.seed()} phiếu mẫu; dữ liệu có sẵn được giữ nguyên.`);
} finally { store.close(); }
