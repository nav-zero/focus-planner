/**
 * Server-side Anthropic proxy — use ANTHROPIC_API_KEY (or VITE_ANTHROPIC_API_KEY) in Vercel env.
 * Keeps the key off the client bundle when you omit VITE_ANTHROPIC_API_KEY.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").json({ error: "Method not allowed" });
    return;
  }

  const key = String(
    process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY || ""
  ).trim();
  if (!key) {
    res.status(500).json({
      error:
        "Server missing ANTHROPIC_API_KEY. Add it under Vercel → Environment Variables (no VITE_ prefix required), then redeploy.",
    });
    return;
  }

  let payload;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  if (!payload || typeof payload !== "object") {
    res.status(400).json({ error: "Expected JSON object" });
    return;
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  const text = await upstream.text();
  res.status(upstream.status).setHeader("Content-Type", "application/json").send(text);
}
