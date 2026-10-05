import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const child = spawn(process.execPath, ["build/server.mjs", "--production"], {
  cwd: root,
  env: { ...process.env, PORT: "0", GEMINI_API_KEY: "", NODE_ENV: "production" },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
child.stderr.on("data", (chunk) => { logs += chunk; });

try {
  const port = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { child.kill(); reject(new Error("Servidor não iniciou: " + logs)); }, 20000);
    const fail = (error) => { clearTimeout(timeout); reject(error); };
    child.once("error", fail);
    child.once("exit", (code) => fail(new Error(`Servidor encerrou (${code}): ${logs}`)));
    child.stdout.on("data", (chunk) => {
      logs += chunk;
      const match = logs.match(/http:\/\/0\.0\.0\.0:(\d+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
  });
  const base = `http://127.0.0.1:${port}`;
  const request = (route, options) => fetch(base + route, { ...options, signal: AbortSignal.timeout(10000) });
  const post = (route, body) => request(route, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});

  const health = await request("/api/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");
  const home = await request("/");
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /id="root"/);
  const asset = html.match(/src="([^\"]+\.js)"/)[1];
  const js = await request(asset);
  assert.equal(js.status, 200);
  assert.match(js.headers.get("content-type"), /javascript/);
  assert.equal((await request("/fila-producao")).status, 200);
  const missing = await request("/api/not-found");
  assert.equal(missing.status, 404);
  assert.ok((await missing.json()).error);
  const invalid = await request("/api/creative-studio/generate", {method:"POST", headers:{"Content-Type":"application/json"}, body:"{"});
  assert.equal(invalid.status, 400);
  assert.ok((await invalid.json()).error);
  assert.equal((await post("/api/creative-studio/generate", {productName:42})).status, 400);
  const creative = await post("/api/creative-studio/generate", {productName:"Vaso de teste"});
  assert.equal(creative.status, 200);
  const generated = await creative.json();
  assert.equal(generated.source, "local");
  assert.equal(generated.data.titles.length, 3);
  assert.equal(typeof generated.data.description, "string");
  assert.ok(Array.isArray(generated.data.tags));
  assert.ok(Array.isArray(generated.data.photoPrompts));
  const market = await post("/api/market-analysis/compare", {userListing:{price:0},competitorListing:{price:0}});
  assert.equal(market.status, 200);
  const analysis = await market.json();
  assert.equal(analysis.source, "local");
  assert.equal(analysis.data.priceGap.difference, 0);
  assert.equal(analysis.data.priceGap.percentage, 0);
  assert.equal((await post("/api/market-analysis/compare", {userListing:{price:-1}})).status, 400);
  const exposed = await request("/server.mjs");
  assert.match(exposed.headers.get("content-type"), /text\/html/);
  console.log("Smoke passed: production startup, PORT, frontend/assets, SPA, APIs, validation and local fallback.");
} finally {
  child.kill();
}
