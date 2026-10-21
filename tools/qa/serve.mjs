import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

/** Serve `root` on an ephemeral loopback port. Dependency-free on purpose:
 * the QA harness must not add anything to the shipped site. */
export async function serve(root, port = 0) {
  const rootDir = resolve(root);

  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url ?? "/", "http://localhost").pathname,
      );
      let file = resolve(
        join(rootDir, pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "")),
      );

      if (file !== rootDir && !file.startsWith(rootDir + sep)) {
        response.writeHead(403).end("forbidden");
        return;
      }

      let info = await stat(file).catch(() => null);
      if (info?.isDirectory()) {
        file = join(file, "index.html");
        info = await stat(file).catch(() => null);
      }
      if (!info?.isFile()) {
        response.writeHead(404).end("not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
      });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(500).end("server error");
    }
  });

  await new Promise((ready, fail) => {
    server.once("error", fail);
    server.listen(port, "127.0.0.1", ready);
  });

  const { port: assignedPort } = server.address();
  return {
    url: `http://127.0.0.1:${assignedPort}`,
    close: () => new Promise((done) => server.close(done)),
  };
}
