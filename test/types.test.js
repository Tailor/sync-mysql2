'use strict';
// npm run test:types   (needs the `typescript` dev dependency)
//
// 1. The declarations type-check real usage, with esModuleInterop off and on,
//    and refuse what the library refuses at run time (test/types/*.ts).
// 2. They declare exactly the public methods lib/index.js defines, so a method
//    added or removed in one place fails here until the other follows.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const tsc = require.resolve('typescript/bin/tsc');

function compile(project) {
  const res = spawnSync(process.execPath, [tsc, '-p', path.join(root, 'test', 'types', project)], { encoding: 'utf8' });
  return { status: res.status, output: (res.stdout || '') + (res.stderr || '') };
}

test('the declarations type-check with esModuleInterop off (import = require)', () => {
  const { status, output } = compile('tsconfig.json');
  assert.equal(status, 0, output);
});

test('the declarations type-check with esModuleInterop on (default import)', () => {
  const { status, output } = compile('tsconfig.interop.json');
  assert.equal(status, 0, output);
});

test('a default import without esModuleInterop is refused, since it would be undefined at run time', () => {
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'sync-mysql2-types-'));
  fs.writeFileSync(path.join(dir, 'wrong.ts'), "import Connection from 'sync-mysql2';\nexport const c = new Connection({});\n");
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      strict: true, noEmit: true, module: 'commonjs', moduleResolution: 'node10', types: [],
      esModuleInterop: false, allowSyntheticDefaultImports: false,
      baseUrl: '.', paths: { 'sync-mysql2': [root] },
    },
    files: ['wrong.ts'],
  }));
  const res = spawnSync(process.execPath, [tsc, '-p', dir], { encoding: 'utf8' });
  assert.notEqual(res.status, 0, 'tsc accepted a default import the runtime cannot satisfy');
  assert.match(res.stdout, /TS1259|esModuleInterop/);
});

test('package.json points at the declarations and publishes them', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.types, 'index.d.ts');
  assert.ok(pkg.files.includes('index.d.ts'));
});

test('the declared methods are exactly the public methods of lib/index.js', () => {
  const source = fs.readFileSync(path.join(root, 'lib', 'index.js'), 'utf8');
  const runtime = [...source.matchAll(/key: '([A-Za-z]\w*)'/g)].map((m) => m[1]).filter((n) => !n.startsWith('_')).sort();
  assert.ok(runtime.length >= 9, `found only ${runtime.length} methods in lib/index.js`);
  const dts = fs.readFileSync(path.join(root, 'index.d.ts'), 'utf8');
  const classBody = dts.slice(dts.indexOf('declare class Connection'));
  const declared = [...classBody.matchAll(/^  ([A-Za-z]\w*)\s*[<(]/gm)].map((m) => m[1]).filter((n) => n !== 'constructor').sort();
  assert.deepEqual(declared, runtime);
  assert.match(source, /module\.exports = Connection;/, 'the declarations use `export =` because the module is CommonJS');
});
