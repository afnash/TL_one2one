import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../lib/coding.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { executeCode, isComputerScience, canEditCode, INITIAL_CODE } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
assert.equal(isComputerScience(' CS ', []), true);
assert.equal(isComputerScience('Computer Science', []), true);
assert.equal(isComputerScience('subject-1', [{ id: 'subject-1', name: 'Computing', code: 'CS' }]), true);
assert.equal(isComputerScience('Physics', []), false);
const session = { teacherId: 't', studentId: 's', studentIds: ['s', 's2'], status: 'LIVE' };
assert.equal(canEditCode(session, 't'), true);
assert.equal(canEditCode(session, 's'), false);
assert.equal(canEditCode({ ...session, codeEditorId: 's2' }, 's2'), true);
assert.equal(canEditCode({ ...session, codeEditorId: 's2' }, 't'), false);
assert.equal(canEditCode({ ...session, codeEditorId: 'stranger' }, 'stranger'), false);
assert.equal(canEditCode({ ...session, status: 'COMPLETED' }, 't'), false);

const routeSource = ts.transpileModule(readFileSync(new URL('../app/api/code/run/route.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { POST } = await import('data:text/javascript;base64,' + Buffer.from(routeSource).toString('base64'));
const originalFetch = globalThis.fetch;
const makeRequest = (body, origin = 'http://localhost') => new Request('http://localhost/api/code/run', {
  method: 'POST', headers: { origin }, body: JSON.stringify(body),
});
try {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/code/run');
    assert.deepEqual(JSON.parse(options.body), INITIAL_CODE);
    return Response.json({ output: 'Hello class\n\nAccepted' });
  };
  assert.match(await executeCode(INITIAL_CODE), /Hello class/);
  await assert.rejects(() => executeCode({ ...INITIAL_CODE, source: ' ' }), /enter some code/);
  await assert.rejects(() => executeCode({ ...INITIAL_CODE, stdin: 'x'.repeat(10001) }), /Limit code/);
  globalThis.fetch = async () => Response.json({ error: 'Compiler is busy' }, { status: 502 });
  await assert.rejects(() => executeCode(INITIAL_CODE), /Compiler is busy/);
  globalThis.fetch = async () => Response.json({});
  await assert.rejects(() => executeCode(INITIAL_CODE), /invalid execution result/);
  assert.equal((await POST(makeRequest(INITIAL_CODE, 'https://stranger.test'))).status, 403);
  assert.equal((await POST(makeRequest({ ...INITIAL_CODE, language: '__proto__' }))).status, 400);
  globalThis.fetch = async (url, options) => {
    assert.match(url, /ce.judge0.com/);
    const payload = JSON.parse(options.body);
    assert.equal(payload.language_id, 71);
    assert.equal(Buffer.from(payload.source_code, 'base64').toString(), INITIAL_CODE.source);
    assert.equal(payload.enable_network, false);
    return Response.json({ status: { id: 3, description: 'Accepted' }, stdout: Buffer.from('Hello class').toString('base64') });
  };
  assert.match((await (await POST(makeRequest(INITIAL_CODE))).json()).output, /Hello class/);
  globalThis.fetch = async () => new Response('Unavailable', { status: 500 });
  assert.equal((await POST(makeRequest(INITIAL_CODE))).status, 502);
  globalThis.fetch = async () => Response.json({ status: { id: 6, description: 'Compilation Error' }, compile_output: Buffer.from('Syntax error').toString('base64') });
  assert.match((await (await POST(makeRequest(INITIAL_CODE))).json()).output, /Syntax error/);
  console.log('Coding checks passed: subject permissions, app route, validation, encoding, compiler errors and outages.');
} finally { globalThis.fetch = originalFetch; }
