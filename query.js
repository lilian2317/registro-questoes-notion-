import { DB, SCHEMA } from "./_config.js";
import { notionClient, json, safeGetTitle } from "./_notion.js";

export default async function handler(req, res) {
  try {
    const { base, q } = req.query || {};
    if (!base || !DB[base]) return json(res, 400, { error: "base inválida" });

    const schema = SCHEMA[base];
    const query = (q || "").trim();
    if (!query) return json(res, 200, { results: [] });

    const notion = notionClient();

    // Busca por título "contains" (rápido e simples).
    const resp = await notion.databases.query({
      database_id: DB[base],
      filter: {
        property: schema.title,
        title: { contains: query },
      },
      page_size: 20,
    });

    const results = (resp.results || []).map(p => ({
      id: p.id,
      title: safeGetTitle(p, schema.title),
    }));

    return json(res, 200, { results });
  } catch (e) {
    return json(res, 500, { error: String(e?.message || e) });
  }
}
