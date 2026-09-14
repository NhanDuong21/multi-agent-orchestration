import { resolve } from 'node:path';
import { createApp } from './app.js';
import { databasePath, IssueStore } from './database.js';

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT phải là số nguyên từ 1 đến 65535.');
const store = new IssueStore(databasePath());
const server = createApp(store, resolve('dist/web')).listen(port, '127.0.0.1', () => {
  console.log(`Mini Issue Tracker API: http://127.0.0.1:${port}`);
  console.log(`SQLite: ${databasePath()}`);
});
server.on('error', error => { store.close(); console.error(error); process.exitCode = 1; });

function shutdown() {
  server.close(() => { store.close(); process.exit(0); });
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
