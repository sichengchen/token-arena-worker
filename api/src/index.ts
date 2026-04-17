import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { health } from "./routes/health";
import type { Env } from "./db";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors({ origin: "*", credentials: true }));

app.route("/", health);

app.notFound((c) => c.json({ error: "Not Found" }, 404));
app.onError((err, c) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Unknown error";
  return c.json({ error: "Internal Server Error", message }, 500);
});

export default app;
