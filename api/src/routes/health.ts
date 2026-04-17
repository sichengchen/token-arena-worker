import { Hono } from "hono";

export const health = new Hono();

health.get("/health", (c) => c.json({ ok: true, version: "0.3.0" }));
