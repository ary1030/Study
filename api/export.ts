import type { VercelRequest, VercelResponse } from "@vercel/node";

function toCSV(cards: any[]) {
  const esc = (s: any) => String(s ?? "").replace(/[\n\r]/g, " ").replace(/;/g, ",");
  return ["Front;Back", ...cards.map((c) => `${esc(c.front)};${esc(c.back)}`)].join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { type, data } = req.body || {};
  try {
    let filename = "study_export", mime = "text/plain", content = "";

    if (type === "notes_md") { filename = "notes.md"; mime = "text/markdown"; content = String(data || ""); }
    else if (type === "flashcards_csv") { filename = "flashcards.csv"; mime = "text/csv"; content = toCSV(Array.isArray(data) ? data : []); }
    else if (type === "quiz_json") { filename = "quiz.json"; mime = "application/json"; content = JSON.stringify(data ?? [], null, 2); }
    else return res.status(400).json({ error: "Unknown type" });

    const base64 = Buffer.from(content, "utf8").toString("base64");
    const href = `data:${mime};base64,${base64}`;
    return res.json({ filename, href });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
}
