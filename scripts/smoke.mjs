import assert from "node:assert/strict";
const base=process.argv[2]||"http://localhost:3000";
const request=(path,init={})=>fetch(base+path,{redirect:"manual",...init});
for(const path of ["/login","/manage"]){const r=await request(path);assert.equal(r.status,200,path);}
let r=await request("/admin/dashboard");assert.equal(r.status,307);assert.equal(r.headers.get("location"),"/manage");
r=await request("/api/manage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:"admin",password:"admin123"})});assert.equal(r.status,403,"Origin required");
r=await request("/api/manage",{method:"POST",headers:{"Content-Type":"application/json",Origin:base},body:JSON.stringify({username:"admin",password:"wrong"})});assert.equal(r.status,401,"Bad password rejected");
r=await request("/api/manage",{method:"POST",headers:{"Content-Type":"application/json",Origin:base},body:JSON.stringify({username:"admin",password:"admin123"})});assert.equal(r.status,200,"Admin login");const setCookie=r.headers.get("set-cookie");assert.match(setCookie,/HttpOnly/i);assert.match(setCookie,/SameSite=strict/i);const cookie=setCookie.split(";")[0];
r=await request("/admin/dashboard",{headers:{Cookie:cookie}});assert.equal(r.status,200,"Admin page with cookie");
r=await request("/api/manage",{headers:{Cookie:cookie}});assert.equal((await r.json()).admin,true);
r=await request("/api/manage",{headers:{Cookie:cookie.slice(0,-1)+(cookie.endsWith("a")?"b":"a")}});assert.equal((await r.json()).admin,false,"Tampered signature rejected");
r=await request("/api/manage",{method:"DELETE",headers:{Cookie:cookie}});assert.equal(r.status,200);assert.match(r.headers.get("set-cookie"),/Expires=Thu, 01 Jan 1970/i);
console.log("PASS: login pages, admin route protection, origin check, invalid credentials, signed cookie, tamper rejection, logout.");
