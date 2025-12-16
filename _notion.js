import { Client } from "@notionhq/client";

export function notionClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("Missing NOTION_TOKEN env var");
  return new Client({ auth: token });
}

export function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function todayISO() {
  // Notion aceita YYYY-MM-DD
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function toPercentString(hits, total) {
  if (!Number.isFinite(hits) || !Number.isFinite(total) || total <= 0) return null;
  const pct = Math.round((hits / total) * 100);
  return `${pct}%`;
}

export function safeGetTitle(page, propName) {
  const p = page?.properties?.[propName];
  if (!p) return "";
  const t = (p.title || []).map(x => x.plain_text).join("");
  return t;
}
