import { DB, SCHEMA } from "./_config.js";
import { notionClient, json, todayISO, toPercentString } from "./_notion.js";

function isEmptyProp(p) {
  if (!p) return true;
  // Notion types: rich_text, number, formula, etc.
  if (p.type === "rich_text") return (p.rich_text || []).length === 0;
  if (p.type === "number") return p.number === null || p.number === undefined;
  if (p.type === "title") return (p.title || []).length === 0;
  if (p.type === "select") return p.select == null;
  if (p.type === "multi_select") return (p.multi_select || []).length === 0;
  if (p.type === "date") return p.date == null;
  if (p.type === "checkbox") return p.checkbox !== true; // empty = unchecked
  // fallback
  return true;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return json(res, 405, { error: "Use POST" });

    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf-8") || "{}");

    const { base, pageId, hits, total, setDate = true } = body || {};
    if (!base || !DB[base]) return json(res, 400, { error: "base inválida" });
    if (!pageId) return json(res, 400, { error: "pageId ausente" });

    const schema = SCHEMA[base];
    const notion = notionClient();

    const pct = toPercentString(Number(hits), Number(total));
    if (pct === null) return json(res, 400, { error: "hits/total inválidos" });

    const props = {};

    if (base === "PGE") {
      // 1) Descobre a próxima coluna de revisão vazia e grava a % nela.
      const page = await notion.pages.retrieve({ page_id: pageId });
      const cols = schema.revisionCols || [];
      if (!cols.length) return json(res, 500, { error: "PGE sem revisionCols configurado" });

      let target = cols[cols.length - 1]; // fallback: última
      for (const col of cols) {
        const p = page?.properties?.[col];
        if (isEmptyProp(p)) { target = col; break; }
      }

      // Grava como rich_text (funciona em 100% dos casos; se sua coluna for number, me avise que eu troco)
      props[target] = { rich_text: [{ type: "text", text: { content: pct } }] };

      // 2) Atualiza data (hoje) se marcado
      if (setDate && schema.lastDate) {
        props[schema.lastDate] = { date: { start: todayISO() } };
      }

    } else {
      // TRT/TRE: atualiza % se a coluna estiver configurada
      if (schema.percent) {
        props[schema.percent] = { rich_text: [{ type: "text", text: { content: pct } }] };
      }
      if (setDate && schema.lastDate) {
        props[schema.lastDate] = { date: { start: todayISO() } };
      }
    }

    await notion.pages.update({
      page_id: pageId,
      properties: props,
    });

    return json(res, 200, { ok: true, percent: pct, updatedProps: Object.keys(props) });
  } catch (e) {
    return json(res, 500, { error: String(e?.message || e) });
  }
}
