import path from "node:path";
import fs from "node:fs";
import app from "./server/app";

async function startServer() {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("PORT deve ser um número entre 0 e 65535.");
  }
  const production = process.env.NODE_ENV === "production" || process.argv.includes("--production");
  if (production) {
    const distPath = path.resolve("dist");
    if (!fs.existsSync(path.join(distPath, "index.html"))) {
      throw new Error("Build não encontrado. Execute npm run build antes de iniciar.");
    }
    app.use("/assets", (await import("express")).default.static(path.join(distPath, "assets"), { immutable: true, maxAge: "1y" }));
    app.use((await import("express")).default.static(distPath));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }
  const server = app.listen(port, "0.0.0.0", () => {
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : port;
    console.log(`Versátil Maker Server running on http://0.0.0.0:${actualPort}`);
  });
  server.on("error", (error) => { console.error(error); process.exitCode = 1; });
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => server.close(() => process.exit(0)));
  }
}

startServer().catch((error) => { console.error(error); process.exitCode = 1; });
