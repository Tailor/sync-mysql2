// Compiled with `tsc --noEmit` by test/types.test.js under two settings
// (esModuleInterop off and on). Every `@ts-expect-error` must be an error,
// and everything else must type-check.
import Connection = require('sync-mysql2');

const options: Connection.ConnectionOptions = {
  host: 'localhost',
  port: 3306,
  user: 'me',
  password: 'secret',
  database: 'app',
  dateStrings: ['DATE'],
  ssl: { rejectUnauthorized: true },
  enableKeepAlive: true, // passed through to mysql2
};
const connection = new Connection(options);

// Rows are column-name records by default, or the type asked for.
const solution: number = connection.query('SELECT 1 + 1 AS solution')[0].solution;
interface User { id: number; name: string }
const users: User[] = connection.query<User>('SELECT * FROM users WHERE id > ? AND active = ?', [10, true]);
const nothing: User[] = connection.query<User>('SELECT * FROM users WHERE deleted_at = ?', [null]);
const user: User | undefined = connection.getRecord<User>('users', 1);
const byKey: User | undefined = connection.getRecord<User>('users', 'abc');

// Procedures answer one result set or several.
const procedure: User[] | User[][] = connection.call<User>('list_users', ['admin', 5]);

// Queued work answers later, synchronously.
const pending: () => User[] = connection.queueQuery<User>('SELECT * FROM users');
const later: User[] = pending();
const queuedCall: () => User[] | User[][] = connection.queueCall<User>('list_users', []);
const updated = connection.update('UPDATE users SET name = ? WHERE id = ?', ['n', 1]);
const queuedUpdate: () => Connection.Row[] = connection.queueUpdate('DELETE FROM users');
connection.finishAll();
connection.dispose();

// The library refuses these at run time, so the types refuse them too.
// @ts-expect-error a config is required
new Connection();
// @ts-expect-error values must be string, number, boolean or null
connection.query('SELECT ?', [new Date()]);
// @ts-expect-error values must be an array
connection.query('SELECT ?', 1);
// @ts-expect-error procedure arguments are required
connection.call('list_users');
// @ts-expect-error a record id is a string or a number
connection.getRecord('users', { id: 1 });
// @ts-expect-error port is a number
const badOptions: Connection.ConnectionOptions = { port: '3306' };

export { solution, users, nothing, user, byKey, procedure, later, queuedCall, updated, queuedUpdate, badOptions };
