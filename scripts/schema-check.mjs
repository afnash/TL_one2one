// Uses an in-memory Postgres runtime. Never connects to the Supabase project.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const loadRuntime = createRequire(import.meta.url);
const { PGlite } = loadRuntime(process.argv[2] || "@electric-sql/pglite");
(async () => {
 const db = new PGlite();
 try {
  await db.exec("create role anon; create role authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id text,bucket_id text,name text); alter table storage.objects enable row level security;");
  const sql = fs.readFileSync("dumb.sql","utf8");
  await db.exec(sql); await db.exec(sql);
  const tables = await db.query("select tablename from pg_tables where schemaname='public' and tablename like 'lms_%'");
  assert.equal(tables.rows.length,11);
  for(const {tablename} of tables.rows) assert.equal((await db.query('select count(*)::int as count from '+tablename)).rows[0].count,0);
  const patch=(table,id,data,previous={})=>db.query("select lms_patch($1,$2,$3::jsonb,$4::jsonb)",[table,id,JSON.stringify(data),JSON.stringify(previous)]);
  const get=async(table,id)=>(await db.query('select data from '+table+' where id=$1',[id])).rows[0].data;
  await patch("lms_teachers","teacher",{name:"Original",email:"before"});
  await patch("lms_teachers","teacher",{email:"after"});
  assert.equal((await get("lms_teachers","teacher")).name,"Original");
  const a={id:"a",x:0}, b={id:"b",x:1}, c={id:"c",x:2};
  await patch("lms_whiteboards","board",{elements:[a]});
  await patch("lms_whiteboards","board",{elements:[a,b]},{elements:[a]});
  await patch("lms_whiteboards","board",{elements:[a,c]},{elements:[a]});
  assert.deepEqual((await get("lms_whiteboards","board")).elements.map(e=>e.id).sort(),["a","b","c"]);
  await patch("lms_whiteboards","board",{elements:[b]},{elements:[a,b]});
  assert.deepEqual((await get("lms_whiteboards","board")).elements.map(e=>e.id).sort(),["b","c"]);
  await patch("lms_whiteboards","board",{elements:[{...b,x:9},c]},{elements:[b,c]});
  assert.equal((await get("lms_whiteboards","board")).elements.find(e=>e.id==="b").x,9);
  await patch("lms_sessions","session",{raisedHands:[],writerIds:[],topic:"Class"});
  await patch("lms_sessions","session",{raisedHands:["one"]},{raisedHands:[]});
  await patch("lms_sessions","session",{raisedHands:["two"]},{raisedHands:[]});
  assert.deepEqual((await get("lms_sessions","session")).raisedHands.sort(),["one","two"]);
  await patch("lms_sessions","session",{writerIds:["one"]},{writerIds:[]});
  await patch("lms_sessions","session",{writerIds:["two"]},{writerIds:[]});
  await patch("lms_sessions","session",{writerIds:[]},{writerIds:["one"]});
  assert.deepEqual((await get("lms_sessions","session")).writerIds,["two"]);
  assert.equal((await get("lms_sessions","session")).topic,"Class");
  await assert.rejects(()=>patch("lms_submissions","invalid-grade",{status:"REVIEWED",maxScore:10,score:11}),/Marks must/);
  await patch("lms_submissions","submission",{assignmentId:"assignment",studentId:"one",status:"REVIEWED",maxScore:10,score:8});
  await assert.rejects(()=>patch("lms_submissions","duplicate",{assignmentId:"assignment",studentId:"one"}),/duplicate key/);
  await assert.rejects(()=>patch("lms_teachers; drop table lms_students","bad",{}),/Unsupported collection/);
  await db.exec("set role anon");
  await patch("lms_profiles","one",{role:"STUDENT"});
  assert.equal((await get("lms_profiles","one")).role,"STUDENT");
  console.log("PASS: full SQL and rerun, empty tables, field patches, stale-client stroke merging, scoped stroke deletion, element edits, raised hands, grant/revoke merging, grade limits, unique submissions, collection allowlist, prototype anon access.");
 } finally { await db.close(); }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
