// Compiled only with esModuleInterop on (test/types/tsconfig.interop.json):
// the default import and the named type import both resolve.
import Connection from 'sync-mysql2';
import type { ConnectionOptions, Value } from 'sync-mysql2';

const options: ConnectionOptions = { host: 'localhost', user: 'me' };
const values: Value[] = ['a', 1, false, null];
const rows = new Connection(options).query('SELECT ?, ?, ?, ?', values);
const first: unknown = rows[0];

export { first };
