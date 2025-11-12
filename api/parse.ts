import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { url } = req.body || {};
  if (!url || typeof url !== "string") return res.status(400).json({ error: "Missing url" });

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
    const ct = r.headers.get("content-type") || "";
    const buf = Buffer.from(await r.arrayBuffer());

    if (ct.startsWith("text/") || url.match(/\.(txt|md|csv|tsv)$/i)) {
      return res.json({ text: buf.toString("utf8") });
    }
    if (ct.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
      return res.json({ text: "[PDF parsing placeholder] Add pdf-parse for real text." });
    }
    if (ct.includes("presentation") || url.toLowerCase().endsWith(".pptx")) {
      return res.json({ text: "[PPTX parsing placeholder] Add JSZip for slide text." });
    }
    return res.json({ text: "[Unsupported file type]" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
}
