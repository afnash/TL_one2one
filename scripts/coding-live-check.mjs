// Sends only fixed test programs to the public compiler through the actual route handler.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync('app/api/code/run/route.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { POST } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const cases = [
  ['Python', 'print(input())', 'Hello class'],
  ['JavaScript', 'console.log("Hello class")', ''],
  ['C', '#include <stdio.h>\nint main(void) { puts("Hello class"); return 0; }', ''],
  ['C++', '#include <iostream>\nint main() { std::cout << "Hello class"; }', ''],
  ['Java', 'public class Main { public static void main(String[] args) { System.out.println("Hello class"); } }', ''],
];
for (const [language, source, stdin] of cases) {
  const response = await POST(new Request('http://localhost/api/code/run', {
    method: 'POST', headers: { origin: 'http://localhost' }, body: JSON.stringify({ language, source, stdin }),
  }));
  const result = await response.json();
  assert.equal(response.status, 200, JSON.stringify(result));
  assert.match(result.output, /Hello class/, language);
  assert.match(result.output, /Accepted/, language);
  console.log(language + ': actual execution passed');
}
