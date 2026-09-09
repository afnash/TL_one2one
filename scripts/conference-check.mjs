// Isolated Postgres tests: never connects to Supabase or inserts real conference data.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { PGlite } = createRequire(import.meta.url)(process.argv[2] || '@electric-sql/pglite');
const db = new PGlite();
try {
  await db.exec("create role anon; create role authenticated; create table public.lms_teachers(id text primary key, data jsonb); insert into public.lms_teachers values ('teacher', '{\"name\":\"Host\"}');");
  const sql = readFileSync('supabase/migrations/20260910_conferences.sql','utf8').replace(/^\uFEFF/, '');
  await db.exec(sql); await db.exec(sql);
  await db.exec('set role anon');
  const token = 'host-secret-credential-with-128-bit-randomness';
  const rpc = async (name, params, values) => (await db.query(`select public.conference_${name}(${params}) as room`, values)).rows[0].room;
  const room = await rpc('create', '$1,$2,$3', ['teacher', 'Workshop', token]);
  assert.match(room.code, /^[0-9A-F]{16}$/);
  assert.equal(room.hostName, 'Host');
  assert.equal(room.revision, 0);
  assert.equal(JSON.stringify(room).includes(token), false);
  assert.equal('host_token_hash' in room, false);
  const guestView = await rpc('read', '$1', [room.code]);
  assert.equal(guestView.videoRoom, room.videoRoom);
  const update = (credential, revision, action, elements = []) => rpc('update', '$1,$2,$3,$4,$5::jsonb', [room.code, credential, revision, action, JSON.stringify(elements)]);
  await assert.rejects(() => update('guest', 0, 'board'), /Only the conference host/);
  await assert.rejects(() => update(null, 0, 'end'), /Only the conference host/);
  await assert.rejects(() => db.query('select * from public.conference_rooms'), /permission denied/);
  await assert.rejects(() => db.query("update public.conference_rooms set data = '{}'"), /permission denied/);
  const saved = await update(token, 0, 'board', [{ id: 'stroke', type: 'pen', points: [{ x: 10, y: 20 }] }]);
  assert.equal(saved.revision, 1);
  assert.equal((await rpc('read', '$1', [room.code])).board.elements[0].id, 'stroke');
  await assert.rejects(() => update(token, 0, 'board'), /another host tab/);
  await assert.rejects(() => update(token, 1, 'board', {}), /Invalid board/);
  const ended = await update(token, 1, 'end');
  assert.equal(ended.status, 'ENDED');
  await assert.rejects(() => update(token, 2, 'board'), /has ended/);
  await assert.rejects(() => rpc('create', '$1,$2,$3', ['student', 'Fake', token]), /teacher profile/);
  await assert.rejects(() => rpc('read', '$1', ['BAD']), /not found/);
  console.log('Conference checks passed: migration reruns, creation, joining, token secrecy, denied guest reads/writes, host edits, stale revisions, and ended-room protection.');
} finally { await db.close(); }
