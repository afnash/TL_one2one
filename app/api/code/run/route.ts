// Code runs only in Judge0's external sandbox, never in the Next.js process.
const languages: Record<string, number> = { Python: 71, JavaScript: 63, C: 50, "C++": 54, Java: 62 };
const endpoint = "https://ce.judge0.com/submissions";
export const maxDuration = 60;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Use Run code from this app." }, { status: 403 });
  let input;
  try {
    const text = await request.text();
    if (text.length > 400000) return Response.json({ error: "Code request is too large." }, { status: 413 });
    input = JSON.parse(text);
  } catch { return Response.json({ error: "Invalid code request." }, { status: 400 }); }
  if (!input || typeof input.language !== "string" || !Object.hasOwn(languages, input.language) ||
      typeof input.source !== "string" || !input.source.trim() || input.source.length > 50000 ||
      typeof input.stdin !== "string" || input.stdin.length > 10000) {
    return Response.json({ error: "Choose a supported language; limit code to 50,000 characters and input to 10,000." }, { status: 400 });
  }
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(45000)]);
  try {
    const read = async (response: Response) => {
      if (!response.ok) throw new Error(response.status === 429 ? "Compiler is busy. Wait a moment and retry." : "Compiler service is unavailable. Please retry shortly.");
      return response.json();
    };
    // Base64 handles Unicode source, input and output without encoding errors.
    let result = await read(await fetch(`${endpoint}?base64_encoded=true&wait=true`, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ language_id: languages[input.language], source_code: Buffer.from(input.source).toString("base64"),
        stdin: Buffer.from(input.stdin).toString("base64"), cpu_time_limit: 5, wall_time_limit: 10, enable_network: false }),
    }));
    for (let attempt = 0; [1, 2].includes(result?.status?.id) && attempt < 25; attempt++) {
      if (typeof result.token !== "string" || !/^[a-z0-9-]+$/i.test(result.token)) throw new Error("Compiler returned an invalid submission.");
      await new Promise(resolve => setTimeout(resolve, 750));
      signal.throwIfAborted();
      result = await read(await fetch(`${endpoint}/${result.token}?base64_encoded=true`, { signal, cache: "no-store" }));
    }
    if (!result?.status || typeof result.status.id !== "number") throw new Error("Compiler returned an invalid result. Please retry.");
    if ([1, 2].includes(result.status.id)) throw new Error("Compiler is still busy. Please run again shortly.");
    const output = [result.compile_output, result.stdout, result.stderr, result.message]
      .filter(value => typeof value === "string" && value)
      .map(value => Buffer.from(value, "base64").toString("utf8")).join("\n");
    return Response.json({ output: `${output || "(No output)"}\n\n${result.status.description || "Finished"}`.slice(0, 60000) });
  } catch (cause) {
    return Response.json({ error: signal.aborted ? "Execution timed out. Try a shorter program or run again." : cause instanceof Error ? cause.message : "Code execution failed." }, { status: 502 });
  }
}
