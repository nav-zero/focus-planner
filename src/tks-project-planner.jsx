import { useState, useEffect, useCallback, useRef } from "react";
import bgHomepage from "../background-1.jpg";

// ══════════════════════════════════════════════════════
//  TKS LOGO (embedded)
// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════════════
const C = {
  bg:         "#0d0e10",
  rail:       "#090a0c",
  surface:    "rgba(255,255,255,0.034)",
  surfaceHov: "rgba(255,255,255,0.058)",
  border:     "rgba(255,255,255,0.072)",
  borderHov:  "rgba(255,255,255,0.14)",
  text:       "rgba(255,255,255,0.85)",
  textDim:    "rgba(255,255,255,0.55)",
  textMuted:  "rgba(255,255,255,0.30)",
  green:      "#3effa0",
  amber:      "#f5a623",
  violet:     "#a78bfa",
  cyan:       "#67e8f9",
  rose:       "#fb7185",
  blue:       "#60a5fa",
};
const F  = "'Inter',system-ui,sans-serif";
const FM = "'Inter',system-ui,sans-serif";
const F_HERO = "'Plus Jakarta Sans','Helvetica Neue',Helvetica,Arial,sans-serif";

// ══════════════════════════════════════════════════════
//  CLAUDE API
// ══════════════════════════════════════════════════════
// Client key (Vite inlines at build). If empty, requests go to /api/claude (server ANTHROPIC_API_KEY on Vercel).
const CLAUDE_API_KEY = String(import.meta.env.VITE_ANTHROPIC_API_KEY ?? "").trim();

async function callClaudeAPI(topic, hours, interests, track="technology") {

  // ── Technology track prompt ────────────────────────────────────────────────
  const techPrompt = `You are a curriculum designer for TKS (The Knowledge Society), a deep tech accelerator for ambitious high-school students.

Generate a personalized project roadmap for a student with:
- Focus topic: "${topic}"
- Available time: ${hours} hours per week
- Personal interests outside tech: "${interests}"

Return ONLY valid JSON (no markdown, no explanation). Use this exact structure:

{
  "label": "short descriptive name for this focus area (e.g. 'AI & Machine Learning')",
  "articles": [
    {"id":"a1","title":"article title","emoji":"relevant emoji","summary":"2-3 sentences explaining the concept clearly — what it is, how it works, why it matters","importance":"one sentence on why a student should understand this","tag":"essential"},
    {"id":"a2","title":"...","emoji":"...","summary":"...","importance":"...","tag":"trending"},
    {"id":"a3","title":"...","emoji":"...","summary":"...","importance":"...","tag":"hot"}
  ],
  "rep1": [
    {"id":"r1a","title":"project title","emoji":"relevant emoji","description":"3-4 sentences — written for a 15-year-old. Describe what they build, what it looks like when it works, and why it's exciting. Use simple language, no jargon. Make them want to start today.","skills":["Skill 1","Skill 2","Skill 3"],"tools":["Specific Tool","Specific Framework","Specific API"],"timeHours":9,"difficulty":1},
    {"id":"r1b","title":"...","emoji":"...","description":"...","skills":["..."],"tools":["..."],"timeHours":10,"difficulty":1}
  ],
  "rep2": [
    {"id":"r2a","title":"advanced project title","emoji":"relevant emoji","description":"3-4 sentences — written for a 15-year-old. Keep it simple and exciting. Explain what they build and why it's impressive. Avoid technical jargon in the description.","skills":["Skill 1","Skill 2","Skill 3","Skill 4"],"tools":["Specific Tool","Specific Framework","Specific API"],"timeHours":20,"difficulty":3},
    {"id":"r2b","title":"...","emoji":"...","description":"...","skills":["..."],"tools":["..."],"timeHours":18,"difficulty":3}
  ],
  "create": [
    {"title":"original project blending topic + interests","emoji":"relevant emoji","description":"3-4 sentences — make this genuinely surprising and personalized to their interests","skills":["..."],"tools":["..."],"timeHours":28},
    {"title":"...","emoji":"...","description":"...","skills":["..."],"tools":["..."],"timeHours":30},
    {"title":"...","emoji":"...","description":"...","skills":["..."],"tools":["..."],"timeHours":25}
  ],
  "recommended_ids": {
    "rep1": "id of the rep1 project that best connects to the student's interests",
    "rep2": "id of the rep2 project that best connects to the student's interests",
    "create": "exact title of the create project that best connects to the student's interests"
  }
}

ARTICLE RULES — read carefully:
- Articles are blog post topics the student will research and write themselves — NOT news summaries
- Topics should be foundational, conceptual, and timeless — how things work, why they matter, what they mean
- Think: "How LLMs understand language", "Why CRISPR is like a find-and-replace for DNA", "What makes a neural network learn"
- Avoid current events, product launches, or news-style titles like "X in 2025" or "The latest breakthrough in Y"
- summary should explain the concept simply — as if explaining to a smart friend who has no background

REPLICATE RULES — read carefully:
- Descriptions must be written for a 15-year-old with no coding experience
- Use simple, plain English — no jargon, no acronyms without explanation
- Write with energy and enthusiasm — make the student excited to build it
- IMPORTANT: Blend the student's interests ("${interests}") directly into the project titles and descriptions. A student who loves music should get music-themed projects; one who loves sports should get sports-themed ones
- Describe what they will actually SEE and USE when the project is done
- Rep I should feel fun and achievable — like something they could show their friends
- Rep II should feel ambitious but not intimidating — emphasize what's cool about the end result
- Rep I: completable in ~${Math.max(8, parseInt(hours) * 2)} hours
- Rep II: completable in ~${Math.max(16, parseInt(hours) * 4)} hours

RECOMMENDED RULES:
- recommended_ids.rep1: id of whichever rep1 project best connects to the student's interests: "${interests}"
- recommended_ids.rep2: id of whichever rep2 project best connects to the student's interests: "${interests}"
- recommended_ids.create: exact title of whichever create project best connects to the student's interests: "${interests}"
- Each section gets its own recommended highlight so the student sees the best pick in every section

OTHER RULES:
- CREATE projects MUST blend "${topic}" with interests like "${interests}" — make them unique and unexpected
- Article titles should also subtly connect to the student's interests where natural
- Use specific tool names (e.g. "LangChain", "Qiskit", "RDKit") not just "Python library"
- timeHours should be realistic for a high-school student
- Emojis should be thematically precise`;

  // ── Science track prompt ───────────────────────────────────────────────────
  const sciPrompt = `You are a curriculum designer for TKS (The Knowledge Society), a deep tech accelerator for ambitious high-school students.

Generate a personalized SCIENCE roadmap for a student with:
- Focus topic: "${topic}"
- Available time: ${hours} hours per week
- Personal interests: "${interests}"

Return ONLY valid JSON (no markdown, no explanation). Use this exact structure:

{
  "label": "short descriptive name for this science area (e.g. 'Neuroscience' or 'Quantum Biology')",
  "articles": [
    {"id":"a1","title":"article title","emoji":"relevant emoji","summary":"2-3 sentences explaining the concept clearly — what it is, how it works, why it matters","importance":"one sentence on why a student should understand this","tag":"essential"},
    {"id":"a2","title":"...","emoji":"...","summary":"...","importance":"...","tag":"trending"},
    {"id":"a3","title":"...","emoji":"...","summary":"...","importance":"...","tag":"hot"}
  ],
  "apply": [
    {"id":"ap1","title":"experiment/simulation title","emoji":"relevant emoji","description":"3-4 sentences. Describe a hands-on experiment or free computer simulation a student can do at home or school without expensive equipment. Be specific about what they observe or discover. Write for a 15-year-old.","skills":["Skill 1","Skill 2","Skill 3"],"tools":["Household item or free software 1","Tool 2","Tool 3"],"timeHours":4,"difficulty":1,"tag":"recommended"},
    {"id":"ap2","title":"...","emoji":"...","description":"...","skills":["..."],"tools":["..."],"timeHours":6,"difficulty":2}
  ],
  "review": [
    {"id":"rv1","title":"review paper title","emoji":"relevant emoji","description":"3-4 sentences. Describe a focused literature review the student can write by reading 6-10 free papers on a specific question within ${topic}. What is the central question? What will they discover? Write for a 15-year-old — make it sound exciting.","skills":["Literature search","Research synthesis","Academic writing","Critical thinking"],"tools":["Google Scholar","PubMed or ArXiv","Zotero (free)","Word or Google Docs"],"timeHours":10,"difficulty":2},
    {"id":"rv2","title":"...","emoji":"...","description":"...","skills":["..."],"tools":["..."],"timeHours":12,"difficulty":2}
  ],
  "idea": [
    {"id":"id1","title":"novel idea title","emoji":"relevant emoji","description":"3-4 sentences. Describe an original experiment, simulation, or research paper idea in ${topic} that doesn't exist yet. Blend with their interests: ${interests}. What gap does it fill? What would be discovered? Make it feel ambitious but exciting.","skills":["Hypothesis formation","Experimental design","Scientific communication","Data analysis"],"tools":["Research databases","Simulation software or lab materials","Analysis tools","Writing tools"],"timeHours":15,"difficulty":3},
    {"id":"id2","title":"...","emoji":"...","description":"...","skills":["..."],"tools":["..."],"timeHours":20,"difficulty":3}
  ],
  "recommended_ids": {
    "apply": "id of the apply project that best connects to the student's interests",
    "review": "id of the review project that best connects to the student's interests",
    "idea": "id of the idea project that best connects to the student's interests"
  }
}

ARTICLE RULES:
- Blog post topics the student will research and write — NOT news
- Foundational, conceptual, timeless — how things work in science
- Think: "How neurons communicate", "Why DNA replication is almost perfect", "What entropy really means"
- summary should explain clearly to someone with no background

APPLY RULES:
- Must be doable at home or school WITHOUT expensive lab equipment
- Prefer free simulation tools (PhET, NetLogo, Jupyter) or simple household materials
- Describe what the student will OBSERVE or DISCOVER — make it feel like real science
- Blend with their interests: "${interests}" where possible

REVIEW RULES:
- The student reads 6-10 real papers and writes a synthesis — like a mini PhD review
- Frame as answering one specific scientific question
- Excite them about becoming an expert through reading

IDEA RULES:
- A genuinely novel concept the student proposes — original hypothesis + methodology
- Should feel ambitious: an experiment they'd want to run if they had the resources
- Blend "${topic}" with interests "${interests}" — make it surprising and personal`;

  const prompt = track === "science" ? sciPrompt : techPrompt;

  const apiBody = JSON.stringify({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  let resp;
  if (CLAUDE_API_KEY) {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: apiBody,
    });
  } else {
    resp = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: apiBody,
    });
  }

  if (!resp.ok) {
    const body = await resp.text();
    if (resp.status === 404) {
      throw new Error(
        "No /api/claude route (are you on Vercel?). For local `npm run dev`, set VITE_ANTHROPIC_API_KEY in .env or run `vercel dev`."
      );
    }
    let parsed = null;
    try {
      parsed = JSON.parse(body);
    } catch {
      /* not JSON */
    }
    if (parsed && typeof parsed.error === "string") {
      throw new Error(parsed.error);
    }
    if (resp.status === 401) {
      throw new Error(
        "Anthropic returned 401 (invalid or missing API key). For production set ANTHROPIC_API_KEY on the server, or VITE_ANTHROPIC_API_KEY for browser calls."
      );
    }
    throw new Error(`API ${resp.status}: ${body.slice(0, 500)}`);
  }
  const data = await resp.json();
  const text = data.content[0].text.trim();
  const clean = text.replace(/^```(?:json)?\n?/,"").replace(/\n?```$/,"");
  const parsed = JSON.parse(clean);

  // Per-section recommended tagging
  const recs = parsed.recommended_ids || {};
  function tagRecSection(arr, recId) {
    if (!recId) return arr || [];
    return (arr||[]).map(p => ({
      ...p,
      tag: (p.id === recId || p.title === recId)
        ? "recommended"
        : (p.tag === "recommended" ? undefined : p.tag),
    }));
  }

  if (track === "science") {
    return {
      category: "custom", track: "science",
      label: parsed.label || topic,
      articles: parsed.articles,
      apply:   tagRecSection(parsed.apply,   recs.apply),
      review:  tagRecSection(parsed.review,  recs.review),
      idea:    tagRecSection(parsed.idea,    recs.idea),
      hoursPerWeek: parseInt(hours) || 5,
      focusTopic: topic, interests,
    };
  }
  return {
    category: "custom", track: "technology",
    label: parsed.label || topic,
    articles: parsed.articles,
    rep1:   tagRecSection(parsed.rep1,   recs.rep1),
    rep2:   tagRecSection(parsed.rep2,   recs.rep2),
    create: tagRecSection(parsed.create, recs.create),
    hoursPerWeek: parseInt(hours) || 5,
    focusTopic: topic, interests,
  };
}

// ══════════════════════════════════════════════════════
//  TKS LOGO (embedded)
// ══════════════════════════════════════════════════════
const TKS_LOGO = "data:image/jpeg;base64,/9j/4QBORXhpZgAATU0AKgAAAAgAAwEaAAUAAAABAAAAMgEbAAUAAAABAAAAOgEoAAMAAAABAAIAAAAAAAAACvyAAAAnEAAK/IAAACcQAAAAAP/tAEBQaG90b3Nob3AgMy4wADhCSU0EBgAAAAAAB//+AQEAAQEAOEJJTQQlAAAAAAAQAAAAAAAAAAAAAAAAAAAAAP/iDFhJQ0NfUFJPRklMRQABAQAADEhMaW5vAhAAAG1udHJSR0IgWFlaIAfOAAIACQAGADEAAGFjc3BNU0ZUAAAAAElFQyBzUkdCAAAAAAAAAAAAAAAAAAD21gABAAAAANMtSFAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEWNwcnQAAAFQAAAAM2Rlc2MAAAGEAAAAbHd0cHQAAAHwAAAAFGJrcHQAAAIEAAAAFHJYWVoAAAIYAAAAFGdYWVoAAAIsAAAAFGJYWVoAAAJAAAAAFGRtbmQAAAJUAAAAcGRtZGQAAALEAAAAiHZ1ZWQAAANMAAAAhnZpZXcAAAPUAAAAJGx1bWkAAAP4AAAAFG1lYXMAAAQMAAAAJHRlY2gAAAQwAAAADHJUUkMAAAQ8AAAIDGdUUkMAAAQ8AAAIDGJUUkMAAAQ8AAAIDHRleHQAAAAAQ29weXJpZ2h0IChjKSAxOTk4IEhld2xldHQtUGFja2FyZCBDb21wYW55AABkZXNjAAAAAAAAABJzUkdCIElFQzYxOTY2LTIuMQAAAAAAAAAAAAAAEnNSR0IgSUVDNjE5NjYtMi4xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYWVogAAAAAAAA81EAAQAAAAEWzFhZWiAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPZGVzYwAAAAAAAAAWSUVDIGh0dHA6Ly93d3cuaWVjLmNoAAAAAAAAAAAAAAAWSUVDIGh0dHA6Ly93d3cuaWVjLmNoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRlc2MAAAAAAAAALklFQyA2MTk2Ni0yLjEgRGVmYXVsdCBSR0IgY29sb3VyIHNwYWNlIC0gc1JHQgAAAAAAAAAAAAAALklFQyA2MTk2Ni0yLjEgRGVmYXVsdCBSR0IgY29sb3VyIHNwYWNlIC0gc1JHQgAAAAAAAAAAAAAAAAAAAAAAAAAAAABkZXNjAAAAAAAAACxSZWZlcmVuY2UgVmlld2luZyBDb25kaXRpb24gaW4gSUVDNjE5NjYtMi4xAAAAAAAAAAAAAAAsUmVmZXJlbmNlIFZpZXdpbmcgQ29uZGl0aW9uIGluIElFQzYxOTY2LTIuMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdmlldwAAAAAAE6T+ABRfLgAQzxQAA+3MAAQTCwADXJ4AAAABWFlaIAAAAAAATAlWAFAAAABXH+dtZWFzAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAACjwAAAAJzaWcgAAAAAENSVCBjdXJ2AAAAAAAABAAAAAAFAAoADwAUABkAHgAjACgALQAyADcAOwBAAEUASgBPAFQAWQBeAGMAaABtAHIAdwB8AIEAhgCLAJAAlQCaAJ8ApACpAK4AsgC3ALwAwQDGAMsA0ADVANsA4ADlAOsA8AD2APsBAQEHAQ0BEwEZAR8BJQErATIBOAE+AUUBTAFSAVkBYAFnAW4BdQF8AYMBiwGSAZoBoQGpAbEBuQHBAckB0QHZAeEB6QHyAfoCAwIMAhQCHQImAi8COAJBAksCVAJdAmcCcQJ6AoQCjgKYAqICrAK2AsECywLVAuAC6wL1AwADCwMWAyEDLQM4A0MDTwNaA2YDcgN+A4oDlgOiA64DugPHA9MD4APsA/kEBgQTBCAELQQ7BEgEVQRjBHEEfgSMBJoEqAS2BMQE0wThBPAE/gUNBRwFKwU6BUkFWAVnBXcFhgWWBaYFtQXFBdUF5QX2BgYGFgYnBjcGSAZZBmoGewaMBp0GrwbABtEG4wb1BwcHGQcrBz0HTwdhB3QHhgeZB6wHvwfSB+UH+AgLCB8IMghGCFoIbgiCCJYIqgi+CNII5wj7CRAJJQk6CU8JZAl5CY8JpAm6Cc8J5Qn7ChEKJwo9ClQKagqBCpgKrgrFCtwK8wsLCyILOQtRC2kLgAuYC7ALyAvhC/kMEgwqDEMMXAx1DI4MpwzADNkM8w0NDSYNQA1aDXQNjg2pDcMN3g34DhMOLg5JDmQOfw6bDrYO0g7uDwkPJQ9BD14Peg+WD7MPzw/sEAkQJhBDEGEQfhCbELkQ1xD1ERMRMRFPEW0RjBGqEckR6BIHEiYSRRJkEoQSoxLDEuMTAxMjE0MTYxODE6QTxRPlFAYUJxRJFGoUixStFM4U8BUSFTQVVhV4FZsVvRXgFgMWJhZJFmwWjxayFtYW+hcdF0EXZReJF64X0hf3GBsYQBhlGIoYrxjVGPoZIBlFGWsZkRm3Gd0aBBoqGlEadxqeGsUa7BsUGzsbYxuKG7Ib2hwCHCocUhx7HKMczBz1HR4dRx1wHZkdwx3sHhYeQB5qHpQevh7pHxMfPh9pH5Qfvx/qIBUgQSBsIJggxCDwIRwhSCF1IaEhziH7IiciVSKCIq8i3SMKIzgjZiOUI8Ij8CQfJE0kfCSrJNolCSU4JWgllyXHJfcmJyZXJocmtyboJxgnSSd6J6sn3CgNKD8ocSiiKNQpBik4KWspnSnQKgIqNSpoKpsqzysCKzYraSudK9EsBSw5LG4soizXLQwtQS12Last4S4WLkwugi63Lu4vJC9aL5Evxy/+MDUwbDCkMNsxEjFKMYIxujHyMioyYzKbMtQzDTNGM38zuDPxNCs0ZTSeNNg1EzVNNYc1wjX9Njc2cjauNuk3JDdgN5w31zgUOFA4jDjIOQU5Qjl/Obw5+To2OnQ6sjrvOy07azuqO+g8JzxlPKQ84z0iPWE9oT3gPiA+YD6gPuA/IT9hP6I/4kAjQGRApkDnQSlBakGsQe5CMEJyQrVC90M6Q31DwEQDREdEikTORRJFVUWaRd5GIkZnRqtG8Ec1R3tHwEgFSEtIkUjXSR1JY0mpSfBKN0p9SsRLDEtTS5pL4kwqTHJMuk0CTUpNk03cTiVObk63TwBPSU+TT91QJ1BxULtRBlFQUZtR5lIxUnxSx1MTU19TqlP2VEJUj1TbVShVdVXCVg9WXFapVvdXRFeSV+BYL1h9WMtZGllpWbhaB1pWWqZa9VtFW5Vb5Vw1XIZc1l0nXXhdyV4aXmxevV8PX2Ffs2AFYFdgqmD8YU9homH1YklinGLwY0Njl2PrZEBklGTpZT1lkmXnZj1mkmboZz1nk2fpaD9olmjsaUNpmmnxakhqn2r3a09rp2v/bFdsr20IbWBtuW4SbmtuxG8eb3hv0XArcIZw4HE6cZVx8HJLcqZzAXNdc7h0FHRwdMx1KHWFdeF2Pnabdvh3VnezeBF4bnjMeSp5iXnnekZ6pXsEe2N7wnwhfIF84X1BfaF+AX5ifsJ/I3+Ef+WAR4CogQqBa4HNgjCCkoL0g1eDuoQdhICE44VHhauGDoZyhteHO4efiASIaYjOiTOJmYn+imSKyoswi5aL/IxjjMqNMY2Yjf+OZo7OjzaPnpAGkG6Q1pE/kaiSEZJ6kuOTTZO2lCCUipT0lV+VyZY0lp+XCpd1l+CYTJi4mSSZkJn8mmia1ZtCm6+cHJyJnPedZJ3SnkCerp8dn4uf+qBpoNihR6G2oiailqMGo3aj5qRWpMelOKWpphqmi6b9p26n4KhSqMSpN6mpqhyqj6sCq3Wr6axcrNCtRK24ri2uoa8Wr4uwALB1sOqxYLHWskuywrM4s660JbSctRO1irYBtnm28Ldot+C4WbjRuUq5wro7urW7LrunvCG8m70VvY++Cr6Evv+/er/1wHDA7MFnwePCX8Lbw1jD1MRRxM7FS8XIxkbGw8dBx7/IPci8yTrJuco4yrfLNsu2zDXMtc01zbXONs62zzfPuNA50LrRPNG+0j/SwdNE08bUSdTL1U7V0dZV1tjXXNfg2GTY6Nls2fHadtr724DcBdyK3RDdlt4c3qLfKd+v4DbgveFE4cziU+Lb42Pj6+Rz5PzlhOYN5pbnH+ep6DLovOlG6dDqW+rl63Dr++yG7RHtnO4o7rTvQO/M8Fjw5fFy8f/yjPMZ86f0NPTC9VD13vZt9vv3ivgZ+Kj5OPnH+lf65/t3/Af8mP0p/br+S/7c/23////uACFBZG9iZQBkgAAAAAEDABADAgMGAAAAAAAAAAAAAAAA/9sAhAAUEREaEhopGBgpMycgJzMnHBwcHCciFxcXFxciEQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMARUaGiEdISIYGCIUDg4OFBQODg4OFBEMDAwMDBERDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wgARCAEAAQADASIAAhEBAxEB/8QAqQABAAIDAQEAAAAAAAAAAAAAAAYHAQIFAwQBAQAAAAAAAAAAAAAAAAAAAAAQAAAGAgEDBAIDAAAAAAAAAAABAgMEBRAGNCAwFoARMTMSNSFBFBEAAQIBBQgNCQcFAAAAAAAAAgEDABARMRJyICEikrLCM3MwMkJSEyNDU2Ojw9ME8EFRYWKDk7PjgHGCFFRk1IGidLTEEgEAAAAAAAAAAAAAAAAAAACA/9oADAMBAQIRAxEAAACZgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOPFiwVfTU+xXuCw1eiwleZLCV9ksBX+CwXl6gA8T2Rvjk8VroWar3uklabgAEbgk8ghizqys0rHXfUZwMZZG2uTOu2C1/fw9wQc6EO8cjGcBnJoDoWLV9pH0gAAAxV1pVafBnGScSiLyg5daWXWZvhktb38OIfJC/TQznXI7vC7RYHp5exx4dZIjMmAAAABVtpVafDjOpOpRF5Qcus7MrMznXYk8a0GcZ+8+ri25CiMA9e5HRYHeqH7i0nM6YAAAAq20qsPiwE5lEWlJy6zsyshtrk21sWHnMYyWD3Kmso5MPtbUqFYseI3jOD6LSqWckoAAAAqy06sPhBOJTFpScusrNrIZwLaxn3Kt+K0K1PH7fiwW17VrOTonykOjPR5wmEPnRJwAAAKstOrD4QTiUxaUnLrKzayALa9/D3HD7gqLSw4GfOzqemgD0NrU5fbAAAAEFnQrxYY4fcD4YVYYrxYY8vUAHz/AECJcaxhWHrZQhUp+wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//aAAgBAgABBQD0Af/aAAgBAwABBQD0Af/aAAgBAQABBQD0RbBYO18fyqcPKpwiPreiHtM8eVTx5TPHlM8FtU8eUzwW0zh5ROHlE4HtM4hHWbjXQ/JajJlbZGaD22y1hewT1grycQY2mc0IW2R3g24l1PTt/DxXfrx8Z/sFlQifRm22dLJvyXZK+qttX61dfPbsGejbiM4f4KH4KFd+v/EweTIzBJMexkCwoRPoxsN+b6i6EpNQU2tGY7C5LkKIiEx2PYW3NLGn8cX3ALB/ET6Bsd5+IV8lnXalFi6yw2wlSSUU3XocwpmvzIy9dolQj7VtzTxp/HF9wAWIn0bBd/4kmfuFAs0NuVY6xJako71tzTBDTuOL7gAjwrbXENLcU6oH8VNC5OZyxIdjKjbXLZEPaYkgIWlwu3bc3GnccX3ABYUCxUxGpslttLSdjpFMr6YFpIrlVVu1aI7VtzQY07ji+4GCB/yCwRmR0FwVg2Ze4tNWbkHLgSISuiHLchOxJKJjPZtuaDGncYX3AwQZoIDrNxULq3cMSHIrlXZN2TIWhLhStZgyBO1SQwSkmk8afINcfs23NxpvGF9wMEIn0S4jc1qxrnK54GKyxcrXo0huU1nb2ENyMaX2rbm403ji+4GYn0C0rW7JmRHciuD4FRdu1aodzEml8iXYR4SbeyVZyMahHNuN2bbm407ji+4GYn0YvqYrFtSTQZg8E4tJGfvmLGXMdixkxGezbc3GnccX/wCvzE+jN1QosSlRXYiyHx0MMOSV0dImsR2p+tzZEnxWePFZ412termRaxly4nis8eKzx4rPEdBttdEqGzMRK09Jm/rE9sHRzyDeu2DhxNOWoQq6PXp9En//2gAIAQICBj8AAH//2gAIAQMCBj8AAH//2gAIAQEBBj8A+xELrM1ZTQMJK2DUec7KKQxIpDEgHi25Noa2qsUjiRSOJFI4kUjiRSOJFI4kUjiRSOJFI4kUjiQBlSoiS/iS5rvEgD6SWrEzIk4vp0YdZxvURxYgCfdXLrO6i+6qWUAOzjTFGGomntj/AB+BhB8QKtLvtI13vVwhgqEK0EK1hug1o/L8TK1qhyNjbsBk3CteDmIkpd5MdTz/AMnXRXeJTJfOV3WaWcV27RbQ/qdLCPNUUEO8PmrkJudH5fiYoWKFhrVDkRRcXooiea4bsBkyr4Twy8Wl51xOV6Fv9t/sanTXEwoqr6owkVPvSUWm0nIlqjAMBQKU74uVd95sT+scypXLeYEj1nOC4bsBkyL4Pw636HjTc/tW/wDo+DzlyRPaNuacd+R9nxcVGhQR9ApViZUnT1wq1eDPftYHU6FyKogrg7k2kr1u5j8z4hJnVSYA5oe/c6tvWbG/rHMqVy3mBI9ZzguG7AZMfl2F44kwi5kP5HNfF5qJ1uSRxJ2nJq822Cro3u8jhGSQxXzjs7+scypXLeYEj1nOC4RplpBJBQa5FX83M8G3CmaqpKtYiXdSuPlOgoJcB0r3cdp7y4rskoF6QWrEzqC4ntJUP4jPcxVdnaL28Jv47fa8FCECoorQQ4Q7I/rHMqVy3mBI9ZzguxZeKqK9Z+2b13lxsIAJMIpVEU3IwXi2EnbLCdFOSPndQ71V1WZLB3TZaM/d+TkThguJpGl3PeM7G/rHMqVy3mBI9Zzgu50vKkcE6vHgmF0ofqO/+pEywrnhVRs/O3yJfx/lRVfBR9e4LVvaO5F5pZiFcbonNZAPt7U0rfT91o9if1jmVK5bzAkes5wXAKTV9RFVWse91kTX1aLRH2LvTN9ZpJReaWYxW8sI6F4kvOBzZ93zUlU0RUWlCwonEVbL0tL2OhhSYVHR3u0d+HynlxcKipMqXlRZXGV3BVksu/UZc2J/WOZUrlvMCR6znBcN2AyYJl5JxL+3pWukhWnL6Uge5cDy0kqOhfShwOcDy0UC80s4Ek43AOCkxGOH7VTlJfEe6/6tif1jmVK5bzAkes5wXDdgMmRWjvEl9s+bPu+dgmXUmMVmVJas1dklnJvtWOl+bCcG4iFvD4tzy1Uik+aD7O7LVs6SFeVJhRKjY70O8lN5eUKZLDX1XHtif1jmVK7bzG5HrOcFw3YDJl4Ru8+CYPSD+n7mFEkmVFmVFuJkVU/rE6yiw0k5Es31PdwDAbUEq+Ws2J/WOZUrtvMbkes5wXDdgMm4V1qYH03W4d/yO+hW3hUSTzLdI20Kka0CMVzmJ8kwy3g/p2e05zY3XQQapmZjh7kiigceKBx4MH0RFIqyVVrbmRxluauSTDP98UDjxQOPFA48ABUoIiv4Ruaj4Iaevc6tzk4n8M5V9h3C69vuovAh2DHtuBjQlGiVLZAOfE/iXEFN61hF8Z3unYqsCgz7YuUPWO/Yl//Z";

function useStyles() {
  useEffect(() => {
    [
      {id:"gf-inter",   href:"https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..900;1,14..32,400..900&display=swap"},
      {id:"gf-jakarta",href:"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"},
    ].forEach(({id,href})=>{
      if(!document.getElementById(id)){
        const l=document.createElement("link");l.id=id;l.rel="stylesheet";l.href=href;
        document.head.appendChild(l);
      }
    });
    if(!document.getElementById("mom-css")){
      const s=document.createElement("style");s.id="mom-css";
      s.textContent=`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{background:#0d0e10;color:rgba(255,255,255,0.85)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideOutLeft{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(-32px)}}
        @keyframes surgeGlow{0%{filter:brightness(2.2) saturate(1.5)}60%{filter:brightness(1.3)}100%{filter:brightness(1)}}
        @keyframes pulseRed{0%,100%{opacity:1}50%{opacity:0.55,filter:brightness(1.8)}}
        @keyframes blinkCursor{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes riseIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
        @keyframes cardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07)}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.18);font-family:inherit}
        input:focus,textarea:focus{outline:none}
        button{cursor:pointer;border:none;background:none;font-family:inherit}
        textarea{resize:vertical}
        .sbl{opacity:0;max-width:0;overflow:hidden;white-space:nowrap;flex-shrink:0;
          transition:opacity 0.11s ease-out,max-width 0.15s ease-out;pointer-events:none}
        .sb-open .sbl{opacity:1;max-width:180px}
        .sb-open .sbl-logo{opacity:1;max-width:60px}
        .sbl-logo{opacity:0;max-width:0;overflow:hidden;white-space:nowrap;flex-shrink:0;
          transition:opacity 0.11s ease-out,max-width 0.15s ease-out}
        .guide-card:hover{transform:translateY(-2px);transition:all 0.18s ease-out}
        .guide-card{transition:all 0.18s ease-out}
      `;
      document.head.appendChild(s);
    }
  },[]);
}

// ══════════════════════════════════════════════════════
//  CONTENT DATABASE
// ══════════════════════════════════════════════════════
const TOPICS = {
  ai:{label:"AI & Machine Learning",keywords:["ai","artificial intelligence","machine learning","ml","llm","gpt","neural","deep learning","nlp","computer vision","openai","anthropic","chatgpt","language model"],
    articles:[
      {id:"a1",title:"How Transformer Architecture Changed Everything",emoji:"🧠",summary:"The transformer model is the backbone of every major AI system — from ChatGPT to image generators. Understanding attention mechanisms lets you read any AI research paper.",importance:"Foundation — every AI breakthrough since 2017 is built on this",tag:"essential"},
      {id:"a2",title:"RLHF: How We Teach AI to Be Actually Helpful",emoji:"🎯",summary:"RLHF turned raw language models into useful assistants. This is why Claude and ChatGPT follow instructions instead of generating random text.",importance:"Industry-defining — used by every major AI lab today",tag:"trending"},
      {id:"a3",title:"AI Agents: The Next Frontier of Autonomous Systems",emoji:"🤖",summary:"AI agents can plan, use tools, browse the web, and complete multi-step tasks. Understanding agentic AI is key to predicting where the field goes next.",importance:"Hottest area in AI right now — massive investment flowing in",tag:"hot"},
    ],
    rep1:[
      {id:"r1a",title:"AI Chatbot with Custom Personality",emoji:"💬",description:"Use the Anthropic or OpenAI API to build a chatbot with a unique persona. Learn how system prompts work, add conversation memory, and give it a distinct character.",skills:["API calls","System prompts","Conversation memory"],tools:["Python or JavaScript","Anthropic API","Streamlit"],timeHours:10,difficulty:1,tag:"recommended"},
      {id:"r1b",title:"Sentiment Analyzer Web App",emoji:"📊",description:"Use a pre-trained Hugging Face model to detect positive, negative, or neutral text. Build a simple UI where users type text and instantly see emotional analysis with confidence scores.",skills:["Hugging Face","UI building","Text processing"],tools:["Python","Hugging Face Transformers","Gradio"],timeHours:8,difficulty:1},
    ],
    rep2:[
      {id:"r2a",title:"RAG System: Chat With Your Own Documents",emoji:"📚",description:"Build a system where users upload PDFs and ask questions. Use embeddings to search documents and feed relevant chunks to an LLM — how most enterprise AI tools work.",skills:["Embeddings","Vector search","Document parsing","LLM integration"],tools:["Python","LangChain","ChromaDB","Anthropic API"],timeHours:20,difficulty:3},
      {id:"r2b",title:"AI Image Classifier with Custom Dataset",emoji:"🖼️",description:"Collect your own image dataset, fine-tune a pre-trained CNN model, and build a web app that classifies new images. Master transfer learning — the most important skill in practical ML.",skills:["Transfer learning","Dataset creation","Model training","Deployment"],tools:["Python","PyTorch","Hugging Face","Gradio"],timeHours:18,difficulty:3},
    ],
  },
  biotech:{label:"Biotech & Synthetic Biology",keywords:["biotech","biology","gene","crispr","synthetic biology","dna","rna","protein","genomics","bioinformatics","pharma","drug discovery"],
    articles:[
      {id:"a1",title:"CRISPR in 2025: From Lab to FDA-Approved Treatments",emoji:"✂️",summary:"CRISPR has moved from lab curiosity to approved clinical treatments for sickle cell disease. Covers what's approved, what's in trials, and what's next.",importance:"Transformative — first CRISPR treatments are changing lives right now",tag:"essential"},
      {id:"a2",title:"AlphaFold and the Protein Folding Revolution",emoji:"🧬",summary:"DeepMind's AlphaFold solved a 50-year grand challenge in biology. This has radically accelerated drug discovery and changed how biologists work.",importance:"Nobel Prize-level — this reshaped the entire drug discovery pipeline",tag:"trending"},
      {id:"a3",title:"Synthetic Biology: Engineering Life Like Software",emoji:"⚙️",summary:"Synthetic biologists design organisms to produce medicines, biofuels, and materials. The merger of biology and engineering is creating a new industrial revolution.",importance:"Billion-dollar startups are being built on this right now",tag:"hot"},
    ],
    rep1:[
      {id:"r1a",title:"DNA Sequence Analyzer Tool",emoji:"🔬",description:"Build a tool that takes a DNA sequence string and analyzes it — count nucleotides, find codons, calculate GC content. Use Biopython to handle the biology.",skills:["Bioinformatics","Python","Biopython"],tools:["Python","Biopython","Streamlit"],timeHours:10,difficulty:1,tag:"recommended"},
      {id:"r1b",title:"3D Protein Structure Visualizer",emoji:"🧪",description:"Download protein data from the PDB and build a 3D visualizer using py3Dmol. Let users search proteins by name and explore their structure.",skills:["PDB data","3D visualization","Scientific APIs"],tools:["Python","py3Dmol","Streamlit"],timeHours:9,difficulty:1},
    ],
    rep2:[
      {id:"r2a",title:"Drug-Target Interaction Predictor",emoji:"💊",description:"Use ML to predict whether a molecule will bind to a protein target. Download from ChEMBL, engineer features using RDKit, and train a classifier.",skills:["Cheminformatics","Feature engineering","ML classification"],tools:["Python","RDKit","scikit-learn","ChEMBL API"],timeHours:22,difficulty:3},
      {id:"r2b",title:"Gene Expression Dashboard",emoji:"📈",description:"Download public RNA-seq data from GEO, process it, and build an interactive dashboard showing which genes are up/downregulated in different conditions.",skills:["Bioinformatics pipeline","Statistical analysis","Interactive viz"],tools:["Python","pandas","Plotly/Dash","GEO datasets"],timeHours:18,difficulty:3},
    ],
  },
  climate:{label:"Climate Tech & Clean Energy",keywords:["climate","clean energy","renewable","solar","wind","carbon","sustainability","green","environment","net zero","emissions","cleantech","ev"],
    articles:[
      {id:"a1",title:"Direct Air Capture: Can We Vacuum CO₂ from the Sky?",emoji:"🌬️",summary:"Companies like Climeworks are building machines that pull CO₂ from the atmosphere. Covers the technology, current costs, and whether it can scale to gigatons.",importance:"Critical — one of few technologies that can actually reverse emissions",tag:"essential"},
      {id:"a2",title:"The Battery Revolution: Why Lithium-Ion Isn't Enough",emoji:"🔋",summary:"Sodium-ion, solid-state, and iron-air batteries are racing to replace lithium-ion for grid-scale storage. Understanding this shapes the entire renewable energy transition.",importance:"Pivotal — energy storage is the #1 bottleneck for renewable adoption",tag:"trending"},
      {id:"a3",title:"Green Hydrogen: Hype or the Fuel of the Future?",emoji:"💧",summary:"Hydrogen from renewable electricity could decarbonize shipping, steel, and cement. Explore why the economics are hard but why $500B+ is flowing in.",importance:"High stakes — massive investment, major unsolved challenges",tag:"hot"},
    ],
    rep1:[
      {id:"r1a",title:"Personal Carbon Footprint Calculator",emoji:"🌱",description:"Build a web app estimating a user's annual carbon footprint based on diet, transport, home energy, and flights. Show how specific changes reduce impact.",skills:["Data modeling","UI forms","Environmental math"],tools:["HTML/JavaScript","or Python + Streamlit"],timeHours:10,difficulty:1,tag:"recommended"},
      {id:"r1b",title:"Live Grid Carbon Intensity Dashboard",emoji:"⚡",description:"Use the ElectricityMaps API to display real-time carbon intensity of electricity grids. Show users the best times to run appliances for minimum carbon impact.",skills:["API integration","Real-time data","Dashboard UI"],tools:["JavaScript","ElectricityMaps API","Chart.js"],timeHours:9,difficulty:1},
    ],
    rep2:[
      {id:"r2a",title:"Solar Panel ROI Optimizer",emoji:"☀️",description:"Calculate optimal solar panel ROI for any location using NASA's solar irradiance API, local electricity prices, and current panel costs.",skills:["Scientific APIs","Financial modeling","Geospatial data"],tools:["Python","NASA POWER API","pandas","Plotly"],timeHours:20,difficulty:3},
      {id:"r2b",title:"50 Years of Climate Change: Interactive Visualizer",emoji:"🌡️",description:"Download historical climate data from NOAA and build an interactive visualization showing temperature anomalies, sea level changes, and extreme weather frequency.",skills:["Large datasets","Statistical analysis","Interactive storytelling"],tools:["Python","pandas","Plotly/Dash","NOAA APIs"],timeHours:18,difficulty:3},
    ],
  },
  space:{label:"Space Technology",keywords:["space","rocket","satellite","nasa","spacex","mars","astronomy","orbital","aerospace","starship","moon","lunar"],
    articles:[
      {id:"a1",title:"Starship and the Economics of Fully Reusable Rockets",emoji:"🚀",summary:"SpaceX's Starship aims to reduce launch costs by 100x, changing who can access space and what becomes economically viable.",importance:"Industry-reshaping — rewriting the economics of everything in space",tag:"trending"},
      {id:"a2",title:"Starlink and the Satellite Internet Revolution",emoji:"🛰️",summary:"Starlink has 6000+ satellites serving millions globally. Explore orbital mechanics, phased-array antennas, and what ubiquitous connectivity means.",importance:"Live impact — millions of people relying on this technology today",tag:"essential"},
      {id:"a3",title:"The New Lunar Race: Why Everyone Is Going Back to the Moon",emoji:"🌕",summary:"NASA's Artemis, China's program, and private landers converge in 2025–2030. Water ice, helium-3, and strategic territory explain why nations race back.",importance:"Geopolitical and economic — trillions of dollars at stake",tag:"hot"},
    ],
    rep1:[
      {id:"r1a",title:"Real-Time ISS Tracker",emoji:"🛸",description:"Use the Open Notify API to track the ISS's live position on an interactive globe, display who's aboard, and calculate pass-over times for any location.",skills:["API integration","Globe rendering","Real-time updates"],tools:["JavaScript","Open Notify API","Leaflet.js"],timeHours:8,difficulty:1,tag:"recommended"},
      {id:"r1b",title:"Satellite Constellation Orbit Visualizer",emoji:"🌍",description:"Download TLE data from Celestrak for any satellite constellation and visualize their orbits in 3D. Show why different orbital altitudes serve different purposes.",skills:["Orbital mechanics","3D visualization","TLE data"],tools:["JavaScript","Three.js","Celestrak"],timeHours:10,difficulty:1},
    ],
    rep2:[
      {id:"r2a",title:"Interplanetary Launch Window Calculator",emoji:"🪐",description:"Build a tool calculating optimal launch windows between Earth and other planets using Hohmann transfer math. Output the next 5 years of ideal windows.",skills:["Orbital mechanics","Physics","Astronomy"],tools:["Python","numpy","Astropy","Plotly"],timeHours:20,difficulty:3},
      {id:"r2b",title:"Exoplanet Discovery Explorer",emoji:"✨",description:"Use NASA's Exoplanet Archive API to analyze 5500+ confirmed exoplanets. Build filters for habitable zone planets and comparison tools for Earth-like worlds.",skills:["Scientific APIs","Astrophysics","Data visualization"],tools:["Python","NASA API","pandas","Plotly"],timeHours:16,difficulty:3},
    ],
  },
  quantum:{label:"Quantum Computing",keywords:["quantum","qubit","superposition","entanglement","quantum computing","qiskit","quantum mechanics"],
    articles:[
      {id:"a1",title:"Quantum Advantage: What It Actually Means vs. the Hype",emoji:"⚛️",summary:"Google and IBM claim quantum supremacy — but what does it mean for practical problems? Cuts through the hype to explain where quantum computers actually outperform classical ones.",importance:"Foundation — understanding this prevents you from believing marketing",tag:"essential"},
      {id:"a2",title:"Post-Quantum Cryptography: Your Encryption Is Under Threat",emoji:"🔐",summary:"Quantum computers could break RSA within a decade. NIST has standardized new quantum-resistant algorithms. This affects every digital system on Earth.",importance:"Urgent — governments are mandating migration to new standards now",tag:"trending"},
      {id:"a3",title:"Quantum Error Correction: The Unsolved Key to Useful Quantum Computers",emoji:"🛠️",summary:"Today's quantum computers make too many errors. Error correction requires thousands of physical qubits per logical qubit. Whoever solves this wins the quantum race.",importance:"Pivotal — this is THE engineering challenge of quantum computing",tag:"hot"},
    ],
    rep1:[
      {id:"r1a",title:"Quantum Circuit Simulator",emoji:"🔮",description:"Use IBM's Qiskit to build and simulate basic quantum circuits. Implement Hadamard and CNOT gates, and visualize quantum states with Bloch spheres.",skills:["Quantum gates","Qiskit basics","Circuit design"],tools:["Python","Qiskit","Matplotlib"],timeHours:10,difficulty:1,tag:"recommended"},
      {id:"r1b",title:"Quantum Random Number Generator",emoji:"🎲",description:"Use Qiskit's simulator or IBM's real quantum hardware (free!) to generate truly random numbers via quantum measurement. Compare to classical pseudo-random statistically.",skills:["Quantum measurement","Statistical analysis","IBM Quantum"],tools:["Python","Qiskit","IBM Quantum"],timeHours:7,difficulty:1},
    ],
    rep2:[
      {id:"r2a",title:"Grover's Algorithm: Quantum Search Implementation",emoji:"🔍",description:"Implement Grover's search algorithm in Qiskit — providing quadratic speedup over classical search. Build the oracle, run it, and visualize quantum vs. classical performance.",skills:["Quantum algorithms","Oracle design","Performance analysis"],tools:["Python","Qiskit","numpy"],timeHours:18,difficulty:3},
      {id:"r2b",title:"BB84 Quantum Key Distribution Simulator",emoji:"🔑",description:"Implement the BB84 quantum cryptography protocol. Simulate the full key exchange including eavesdropping detection and key sifting.",skills:["Quantum cryptography","Protocol implementation","Security analysis"],tools:["Python","numpy","Custom simulation"],timeHours:16,difficulty:3},
    ],
  },
  fintech:{label:"Fintech & Web3",keywords:["fintech","crypto","blockchain","web3","defi","nft","bitcoin","ethereum","finance","banking","trading","investment"],
    articles:[
      {id:"a1",title:"DeFi: How Crypto Is Rebuilding Finance Without Banks",emoji:"🏦",summary:"DeFi protocols hold $100B+ in assets. Understanding AMMs, lending protocols, and yield farming reveals how this parallel financial system actually works.",importance:"Live market — real money, real impact, real career opportunities",tag:"trending"},
      {id:"a2",title:"Central Bank Digital Currencies: When Governments Go Digital",emoji:"🏛️",summary:"130+ countries are exploring CBDCs. China's digital yuan has millions of users. This could reshape monetary policy within your lifetime.",importance:"Policy-shaping — affects every currency and financial system on Earth",tag:"essential"},
      {id:"a3",title:"AI in Trading: How Algorithms Dominate Financial Markets",emoji:"📈",summary:"80%+ of stock trades are algorithmic. Explore how ML models and HFT work in modern finance — and where human edge still exists.",importance:"Career-relevant — essential knowledge for any finance or tech career",tag:"hot"},
    ],
    rep1:[
      {id:"r1a",title:"Crypto Portfolio Tracker Dashboard",emoji:"💎",description:"Build a real-time dashboard tracking crypto prices via CoinGecko's free API. Users input holdings and see current value, gain/loss, and portfolio allocation charts.",skills:["API integration","Financial math","Dashboard UI"],tools:["JavaScript","CoinGecko API","Chart.js"],timeHours:10,difficulty:1,tag:"recommended"},
      {id:"r1b",title:"Stock Pattern Recognition Tool",emoji:"📉",description:"Download historical stock data with yfinance, calculate technical indicators (RSI, MACD, Bollinger Bands), and build a scanner that identifies classic chart patterns.",skills:["Financial time series","Technical analysis","Visualization"],tools:["Python","yfinance","pandas","Plotly"],timeHours:12,difficulty:2},
    ],
    rep2:[
      {id:"r2a",title:"DeFi Yield Aggregator Dashboard",emoji:"🌾",description:"Query DeFi protocols (Aave, Compound, Uniswap) via APIs to compare yield rates, TVL, and risk scores. Show risk-adjusted returns and historical APY trends.",skills:["DeFi protocols","Web3 APIs","Financial risk analysis"],tools:["Python","Web3.py","Plotly/Dash"],timeHours:22,difficulty:3},
      {id:"r2b",title:"Algorithmic Trading Backtester",emoji:"⚙️",description:"Build a backtesting framework for trading strategies. Implement moving average crossover and RSI-based trading. Measure Sharpe ratio, max drawdown, and annualized returns.",skills:["Backtesting logic","Strategy implementation","Performance metrics"],tools:["Python","Backtrader","yfinance","pandas"],timeHours:20,difficulty:3},
    ],
  },
  general:{label:"Technology",keywords:[],
    articles:[
      {id:"a1",title:"The State of [TOPIC]: Key Breakthroughs in 2024–2025",emoji:"🔬",summary:"Research the most important recent developments in your focus area. Identify the key players, problems being solved, and milestones that matter most.",importance:"Start here — you need foundational knowledge first",tag:"essential"},
      {id:"a2",title:"The Business of [TOPIC]: Who's Winning and Why",emoji:"💼",summary:"Explore the major companies, startups, and research institutions in your field. Understand the competitive landscape and what's driving investment.",importance:"Industry map — understanding who the players are changes how you see the space",tag:"trending"},
      {id:"a3",title:"The Ethics and Risks of [TOPIC]: What Experts Worry About",emoji:"⚖️",summary:"Every powerful technology has risks. Research the ethical debates, regulatory landscape, and potential harms that serious people in your field worry about.",importance:"Critical thinking — the best builders understand risks and responsibility",tag:"hot"},
    ],
    rep1:[
      {id:"r1a",title:"Interactive Data Dashboard for Your Topic",emoji:"📊",description:"Find a public dataset related to your focus topic and build an interactive dashboard that tells a compelling story. Add charts, filters, and clear takeaways.",skills:["Data analysis","Visualization","Data storytelling"],tools:["Python + Streamlit","Plotly","Kaggle or data.gov"],timeHours:10,difficulty:1,tag:"recommended"},
      {id:"r1b",title:"Expert Chatbot for Your Focus Area",emoji:"🤖",description:"Build a chatbot given deep knowledge about your topic via system prompts. Make it answer questions better than a generic AI.",skills:["Prompt engineering","API integration","Domain knowledge"],tools:["Python","Anthropic API","Streamlit"],timeHours:8,difficulty:1},
    ],
    rep2:[
      {id:"r2a",title:"AI-Powered News Aggregator for Your Field",emoji:"📰",description:"Build a tool that collects news, uses an LLM to classify and summarize articles, and presents an organized daily briefing you'd actually use.",skills:["Web scraping","LLM integration","Content classification"],tools:["Python","BeautifulSoup","Anthropic API","Streamlit"],timeHours:18,difficulty:3},
      {id:"r2b",title:"Predictive Model for Your Industry",emoji:"🎯",description:"Define a prediction problem, collect or download data, and build an ML model. Could be predicting outcomes, classifying types, or forecasting trends.",skills:["Problem framing","Data collection","ML modeling","Evaluation"],tools:["Python","scikit-learn","pandas","Streamlit"],timeHours:20,difficulty:3},
    ],
  },
};

const CREATE_TEMPLATES = {
  art:[{title:"Generative Art Engine",emoji:"🎨",description:"Build an algorithm that generates unique visual art from your topic's data. AI attention patterns, protein structures, market data — every dataset becomes art.",skills:["Generative algorithms","Creative coding","Visual design"],tools:["Python + matplotlib","or p5.js","Canvas API"],timeHours:25},{title:"Interactive Visual Explainer",emoji:"🖌️",description:"Build a beautiful, interactive visual tool explaining a complex concept to someone with zero background. Make the invisible visible through animations.",skills:["D3.js","Animation","UX design"],tools:["JavaScript + D3.js","SVG","React"],timeHours:30}],
  music:[{title:"Data Sonification Tool",emoji:"🎵",description:"Turn data from your topic into music. Map variables to pitch, rhythm, and timbre. Stock prices as melody, climate data as ambient soundscapes.",skills:["Audio programming","Data mapping","Music theory"],tools:["Python + Music21","Tone.js","Web Audio API"],timeHours:28},{title:"AI Music Collaborator",emoji:"🎹",description:"Build a tool generating music in your unique style. Prompt an AI music model, create a generation interface, and curate outputs into something genuinely yours.",skills:["AI music tools","Prompt engineering","Audio processing"],tools:["Magenta.js","Suno API","Web Audio API"],timeHours:25}],
  gaming:[{title:"Educational Simulation Game",emoji:"🎮",description:"Build a game teaching a real concept from your focus area. Players make decisions and see consequences — a pandemic simulation, portfolio game, or protein folding puzzle.",skills:["Game logic","Educational design","Simulation systems"],tools:["JavaScript + Phaser.js","or Python + Pygame"],timeHours:35},{title:"Retro Arcade Knowledge Quiz",emoji:"👾",description:"Build a full arcade-style quiz game covering your topic. Multiple question types, leaderboards, increasing difficulty, power-ups — make it something you'd actually play.",skills:["Game development","State management","Content creation"],tools:["JavaScript + Canvas","Phaser.js","React"],timeHours:25}],
  sports:[{title:"Performance Analytics Dashboard",emoji:"⚽",description:"Build a data analytics dashboard for a sport you love, powered by techniques from your focus area. Surface insights that coaches and analysts would actually want.",skills:["Sports data","Statistical modeling","Dashboard UI"],tools:["Python","Sports APIs","pandas","Plotly"],timeHours:28},{title:"AI Training Optimizer",emoji:"🏃",description:"Build a training recommendation tool applying your focus technology to optimize athletic performance. Users input goals — the tool generates adaptive plans.",skills:["Recommendation systems","UX design","Personalization"],tools:["Python","Anthropic API","JSON database"],timeHours:25}],
  social:[{title:"Community Impact Tool",emoji:"🤝",description:"Identify a real problem in your community, apply your focus technology to help solve it. Build something real people will use. Document the problem, solution, and impact.",skills:["Problem research","Product thinking","Impact measurement"],tools:["Web stack of your choice","Anthropic API"],timeHours:35},{title:"Awareness Campaign Dashboard",emoji:"📢",description:"Build a data-driven tool making a complex issue undeniable and shareable. Visualize the scale, show who's affected, make the case for action compellingly.",skills:["Data storytelling","Advocacy design","Visualization"],tools:["D3.js","Python + Plotly","React"],timeHours:25}],
  environment:[{title:"Local Environmental Monitor",emoji:"🌿",description:"Track and visualize environmental data for your local area using public APIs. Apply your focus tech to surface insights locals would actually use.",skills:["Environmental APIs","Civic tech","Visualization"],tools:["Python","AirNow API","iNaturalist API"],timeHours:28},{title:"Biodiversity Analyzer",emoji:"🦋",description:"Analyze patterns in biodiversity or ecosystem health using open datasets. Apply your focus technology to find trends humans might miss.",skills:["Ecological data","ML modeling","Science communication"],tools:["Python","GBIF API","pandas"],timeHours:30}],
  business:[{title:"Startup Opportunity Analyzer",emoji:"💡",description:"Analyze the opportunity landscape in your focus industry. Pull from job postings, funding databases, and patent filings. Surface where gaps and unsolved problems are.",skills:["Market research","Data aggregation","Business analysis"],tools:["Python","Crunchbase API","Anthropic API"],timeHours:30},{title:"Competitive Intelligence Dashboard",emoji:"🏆",description:"Build a live dashboard tracking competitors, trends, and opportunities. Aggregate news, product launches, funding, and hiring signals.",skills:["Data aggregation","Business intelligence","Monitoring"],tools:["Python","News APIs","Anthropic API","Streamlit"],timeHours:28}],
  writing:[{title:"Automated Research Digest",emoji:"📝",description:"Build a tool that automatically finds, reads, and summarizes the latest papers in your focus area. Output a beautiful digest — like a personalized newsletter you'd subscribe to.",skills:["Content aggregation","LLM summarization","Scheduling"],tools:["Python","ArXiv API","Anthropic API"],timeHours:25},{title:"Interactive Knowledge Base",emoji:"📖",description:"Build a beautifully organized, searchable knowledge base for your topic. Curate papers, companies, concepts, timelines. Make it the best resource on the internet.",skills:["Information architecture","Full-text search","Content curation"],tools:["JavaScript","Meilisearch","Markdown"],timeHours:30}],
  general:[{title:"Personal AI Research Assistant",emoji:"🤖",description:"Build an AI tool specifically trained on your focus topic. It knows the jargon, the key players, the history. Build the tool you wish existed when you started.",skills:["RAG systems","Prompt engineering","UI/UX"],tools:["Python","Anthropic API","Vector DB","Streamlit"],timeHours:30},{title:"Prediction & Forecasting Engine",emoji:"🔮",description:"Identify an important unknown in your focus area and build a forecasting tool. Use real data, build your model, and make your predictions public.",skills:["Forecasting","Data collection","Model building"],tools:["Python","pandas","scikit-learn","Plotly"],timeHours:28},{title:"The Explainer: Interactive Learning Experience",emoji:"🎓",description:"Build the best interactive explainer in the world for one concept from your focus area. Combine text, demos, quizzes, and visualizations into one elegant web experience.",skills:["Education design","Interactive UI","Content writing"],tools:["React","D3.js","Three.js","CSS animations"],timeHours:32}],
};

// ══════════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════════
function detectCategory(topic){const t=topic.toLowerCase();for(const[cat,data]of Object.entries(TOPICS)){if(cat==="general")continue;if(data.keywords.some(k=>t.includes(k)))return cat;}return "general";}
function detectInterests(str){const s=str.toLowerCase();const found=[];if(/art|design|visual|creat|draw|paint/.test(s))found.push("art");if(/music|sound|audio|song|beat|melody/.test(s))found.push("music");if(/game|gaming|video game|esport/.test(s))found.push("gaming");if(/sport|fitness|athlete|workout|exercise/.test(s))found.push("sports");if(/social|community|impact|volunteer|help/.test(s))found.push("social");if(/environment|nature|eco|animal|planet/.test(s))found.push("environment");if(/business|entrepreneur|startup|invest|market/.test(s))found.push("business");if(/writ|story|blog|journal|communicate/.test(s))found.push("writing");return found.length?found:["general"];}
function getCreateProjects(interests,count=3){const pool=[],seen=new Set();for(const i of interests)pool.push(...(CREATE_TEMPLATES[i]||CREATE_TEMPLATES.general));pool.push(...CREATE_TEMPLATES.general);return pool.filter(p=>{if(seen.has(p.title))return false;seen.add(p.title);return true;}).slice(0,count);}
function generateContent(focusTopic,hoursPerWeek,interests){const category=detectCategory(focusTopic);const data=TOPICS[category];const fix=s=>s.replace(/\[TOPIC\]/g,focusTopic);return{category,label:category==="general"?focusTopic:data.label,articles:data.articles.map(a=>({...a,title:fix(a.title),summary:fix(a.summary)})),rep1:data.rep1,rep2:data.rep2,create:getCreateProjects(detectInterests(interests)),hoursPerWeek:parseInt(hoursPerWeek),focusTopic,interests};}
function calcSchedule(totalHours,hpw){const weeks=Math.max(1,Math.ceil(totalHours/hpw));let h=totalHours,w=1;const schedule=[];while(h>0&&w<=weeks){const tw=Math.min(hpw,h);schedule.push({week:w,hours:tw});h-=tw;w++;}return{weeks,schedule,totalHours};}
function rgbOf(hex){if(!hex||hex[0]!=='#')return "255,255,255";const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `${r},${g},${b}`;}
function getGuide(type,project,hpw){
  const title=project?.title||"this project";
  const tool0=project?.tools?.[0]||"Python";
  const tool1=project?.tools?.[1]||"your tools";
  const skill0=project?.skills?.[0]||"the core concepts";
  const skill1=project?.skills?.[1]||"the main logic";
  const g={
    article:{steps:[
      {n:1,title:"Map the Landscape",time:"Day 1–2",
       desc:"Google your topic + 'explained for beginners'. Read 5+ different articles or videos. Build a vocabulary list of terms you don't know yet. You're not trying to understand everything — just get the lay of the land.",
       claude:`"Give me a beginner-friendly overview of ${title} — what are the key concepts and why does it matter?"`,
       youtube:`"${title} explained for beginners"`},
      {n:2,title:"Go Deep on Primary Sources",time:"Day 3–5",
       desc:"Find 1–2 original research papers or foundational essays (try arxiv.org or Google Scholar). Use Claude to break down any confusing parts. Take notes only in your own words — no copy-pasting.",
       claude:`"What are the 3 most important foundational ideas in ${title} that I need to truly understand?"`,
       youtube:`"${title} how it actually works deep dive"`},
      {n:3,title:"Find the Controversy",time:"Day 6–7",
       desc:"Search your topic + 'problems', 'criticism', or 'limitations'. Find what smart, skeptical people say about it. The best articles are honest about trade-offs — that's what makes them credible.",
       claude:`"What are the biggest criticisms, limitations, or unsolved problems in ${title}?"`,
       youtube:`"${title} problems and limitations"`},
      {n:4,title:"Write Your Draft",time:"Week 2",
       desc:"Write as if you're explaining this to a curious 16-year-old who's never heard of it. Cover: what it is, how it works, why it matters, and what you personally think. Aim for 600–900 words.",
       claude:`"Read my article introduction and tell me if it's clear to someone with no background: [paste your intro here]"`,
       youtube:`"How to write a great explainer article"`},
      {n:5,title:"Review + Publish",time:"Week 2–3",
       desc:"Share your draft with at least one person and get honest feedback. Then post it — Medium, Substack, or a personal blog all work. Publishing your thinking is part of the TKS mission.",
       claude:`"Help me write a punchy title and opening hook for my article about ${title}"`,
       youtube:`"How to publish your first article on Medium"`},
    ],schedule:calcSchedule(10,hpw)},
    rep1:{steps:[
      {n:1,title:"Set Up Your Environment",time:"Hour 1",
       desc:`Install ${project?.tools?.join(", ")||"the required tools"} on your computer. Create a project folder on your desktop. Get any API keys you need — most are free to sign up for. A clean setup prevents 90% of headaches.`,
       claude:`"How do I install ${tool0} step by step? I'm a complete beginner on a Mac/Windows."`,
       youtube:`"${tool0} setup and installation for beginners"`},
      {n:2,title:"Build the Core Feature",time:"Hours 2–5",
       desc:"Get the main thing working first — don't worry about making it look good yet. Even if it only outputs text in the terminal, that's a win. Get something working fast.",
       claude:`"I want to build ${title}. What's the simplest starter code to get the core feature working? I'm a beginner."`,
       youtube:`"${title} beginner tutorial"`},
      {n:3,title:"Add Your Personal Touch",time:"Hours 6–8",
       desc:"Add one thing that no tutorial has — change the dataset, add a feature you wish it had, or customize the output. One unique detail makes it 10× more impressive when you show people.",
       claude:`"What's a fun, unique feature I could add to my ${title} to make it different from every other version online?"`,
       youtube:`"${tool0} intermediate tips and tricks"`},
      {n:4,title:"Build the Interface",time:"Hours 8–9",
       desc:"Wrap your code in a simple interface so anyone can use it — not just you. It doesn't need to be beautiful, just clear. Your friends should be able to use it in 30 seconds without you explaining.",
       claude:`"How do I add a simple web interface to my ${tool0} project so non-coders can use it?"`,
       youtube:`"${tool1} beginner UI tutorial"`},
      {n:5,title:"Ship It",time:"Hour 10",
       desc:"Deploy it online for free (Streamlit Cloud, Vercel, and Hugging Face Spaces are all free). Write two sentences explaining what it does. Post it somewhere. Getting real people to use your work is where the real learning happens.",
       claude:`"How do I deploy my ${tool0} project for free so anyone can use it from a browser link?"`,
       youtube:`"Deploy ${tool0} app online for free"`},
    ],schedule:calcSchedule(project?.timeHours||10,hpw)},
    rep2:{steps:[
      {n:1,title:"Review the Prerequisites",time:"Hour 1",
       desc:`Before you start, make sure you're comfortable with ${project?.skills?.slice(0,2).join(" and ")||"the basics"}. If anything feels fuzzy, spend 30 minutes reviewing it — that investment will save you hours of confusion later.`,
       claude:`"Can you quiz me on ${skill0} to check if I know enough to start building ${title}?"`,
       youtube:`"${skill0} crash course"`},
      {n:2,title:"Design the Architecture",time:"Hours 1–2",
       desc:"Before writing a single line of code, sketch the full system on paper or in a doc. What are the main pieces? How does data flow between them? Thinking first saves you 3× the debugging time.",
       claude:`"Help me design the system architecture for ${title}. What are the main components and how should they connect?"`,
       youtube:`"Software system design explained for beginners"`},
      {n:3,title:"Build the Foundation",time:"Hours 2–8",
       desc:`Set up your environment, install ${project?.tools?.slice(0,2).join(" and ")||"your tools"}, and get data moving through your pipeline first. Every advanced project runs on boring infrastructure — get this right before anything else.`,
       claude:`"How do I set up ${tool0} and ${tool1} and get them working together? Walk me through it step by step."`,
       youtube:`"${tool0} ${tool1} tutorial"`},
      {n:4,title:"Implement the Main Logic",time:"Hours 8–15",
       desc:`Now build the core — the ${skill1}. Break it into the smallest possible pieces and test each one before moving on. If something isn't working, don't move forward. Small wins compound.`,
       claude:`"I'm stuck implementing ${skill1} for ${title}. Can you explain how it works and show me a simple working example?"`,
       youtube:`"${skill1} from scratch tutorial"`},
      {n:5,title:"Polish and Evaluate",time:"Hours 15–18",
       desc:"Add error handling so it doesn't crash on weird inputs. Honestly test what it gets wrong — be your own harshest critic. Then build a simple interface and write a README explaining what it does.",
       claude:`"How do I add solid error handling to my ${tool0} project so it handles unexpected inputs gracefully?"`,
       youtube:`"Python error handling and testing tutorial"`},
      {n:6,title:"Present Your Work",time:"Hour 18+",
       desc:"Record a 2-minute screen recording of it working. Write one paragraph: what you built, the biggest challenge you hit, and what you'd do differently. Communicating your work clearly is as valuable as building it.",
       claude:`"Help me write a compelling one-paragraph description of my ${title} project for my portfolio or LinkedIn."`,
       youtube:`"How to demo and present a coding project"`},
    ],schedule:calcSchedule(project?.timeHours||18,hpw)},
    create:{steps:[
      {n:1,title:"Define the Problem",time:"Week 1",
       desc:"Write one paragraph: who is this for, what exact problem does it solve, and why does it need to exist? Before building anything, talk to 3 real people in your target audience. What you hear will surprise you.",
       claude:`"Help me write a clear problem statement for my project idea: ${title}. What questions should I be able to answer?"`,
       youtube:`"How to define your startup problem"`},
      {n:2,title:"Design Before You Build",time:"Week 1",
       desc:"Sketch the UI on paper — boxes, arrows, buttons. Write the core user journey step by step. Map the technical pieces. Define exactly what 'done' looks like so you know when to stop adding features.",
       claude:`"What's the simplest possible UI design for ${title}? Help me sketch it out — what screens and buttons do I need?"`,
       youtube:`"App design process for beginners no experience needed"`},
      {n:3,title:"Build the MVP",time:"Weeks 2–3",
       desc:"Build the absolute simplest version that proves your idea works. Resist every urge to add features. Ugly is fine. The goal is to get something in front of real people within 2 weeks.",
       claude:`"I'm building ${title}. What's the absolute minimum I need to build first to prove the concept works?"`,
       youtube:`"How to build an MVP from scratch"`},
      {n:4,title:"Test with Real People",time:"Week 3",
       desc:"Get your project in front of at least 5 people who aren't your close friends. Put it in their hands and watch silently — don't explain anything. Write down every moment they look confused or lost.",
       claude:`"What questions should I ask people when user-testing ${title}? I want honest, useful feedback — not just compliments."`,
       youtube:`"User testing basics for beginners"`},
      {n:5,title:"Iterate on Feedback",time:"Week 4",
       desc:"Pick the top 3 things that confused users and fix those. Don't try to fix everything at once. Then test again with new people. Build → test → fix is how every real product in the world is made.",
       claude:`"I got this feedback on ${title}: [paste feedback]. Help me decide what to prioritize fixing first."`,
       youtube:`"How to use user feedback to improve your product"`},
      {n:6,title:"Tell Your Story",time:"Week 5+",
       desc:"Write up what you built, why you built it, what broke, what surprised you, and what you learned. TKS students stand out because they can articulate the full journey — not just show a polished final product.",
       claude:`"Help me write a compelling project story for ${title} — covering what I built, the problem it solves, and what I learned."`,
       youtube:`"How to write about your project for your portfolio"`},
    ],schedule:calcSchedule(project?.timeHours||32,hpw)},

    // ── Science track types ──────────────────────────
    apply:{steps:[
      {n:1,title:"Understand the Science",time:"Day 1–2",
       desc:"Before you run any experiment, read enough to understand WHY it works. Look up the underlying scientific principles. Watch a video or two. Write 3 sentences explaining the concept in your own words.",
       claude:`"Explain the science behind ${title} in simple terms a 15-year-old can understand. What principles make this experiment work?"`,
       youtube:`"${title} science explained"`},
      {n:2,title:"Plan Your Experiment",time:"Day 2–3",
       desc:"Write down your hypothesis (what you predict will happen and why), list all the materials you need, define your variables (what you'll change, what you'll measure, what stays the same), and write your step-by-step protocol before touching anything.",
       claude:`"Help me write a hypothesis and experimental protocol for ${title}. What should I measure and control for?"`,
       youtube:`"How to write a science experiment hypothesis and protocol"`},
      {n:3,title:"Run It",time:"Day 3–4",
       desc:"Follow your protocol exactly. Record EVERYTHING — even things that seem unimportant. Take photos or short videos. If something goes wrong, write that down too. Unexpected results are often more interesting than expected ones.",
       claude:`"My experiment on ${title} gave unexpected results: [describe what happened]. What might explain this?"`,
       youtube:`"How to record scientific observations"`},
      {n:4,title:"Analyze Your Data",time:"Day 5",
       desc:"Look at your results and ask: does this support or contradict my hypothesis? What patterns do you see? Use a simple spreadsheet or graph. Be honest — it's OK (and interesting!) if your hypothesis was wrong.",
       claude:`"Help me analyze these results from my ${title} experiment: [paste data]. What conclusions can I draw?"`,
       youtube:`"How to analyze data from a science experiment"`},
      {n:5,title:"Write It Up",time:"Day 6–7",
       desc:"Write a short report: intro (background + hypothesis), methods, results (with your data or graph), discussion (what did you find, what explains it, what would you do differently). This is how real scientists communicate their work.",
       claude:`"Help me write the discussion section for my ${title} experiment. My hypothesis was [X] and I found [Y]."`,
       youtube:`"How to write a science experiment report"`},
    ],schedule:calcSchedule(project?.timeHours||6,hpw)},

    review:{steps:[
      {n:1,title:"Define Your Question",time:"Day 1",
       desc:"A literature review answers one specific question. Make it narrow enough to be answerable. 'How does exercise affect memory?' is better than 'How does exercise affect health?'. Write your question down and don't change it.",
       claude:`"Help me narrow down a good literature review question for ${title}. I want something specific enough to find 8-10 papers on."`,
       youtube:`"How to write a literature review — choosing your question"`},
      {n:2,title:"Find Your Papers",time:"Days 2–3",
       desc:"Use Google Scholar, PubMed, or ArXiv. Search your question directly. Aim for 8–12 papers. Prioritize papers with many citations. Use Zotero (free) to save everything. You don't need to read the full papers yet — just titles and abstracts.",
       claude:`"What are the best search terms I should use on Google Scholar to find papers about ${title}?"`,
       youtube:`"How to search Google Scholar for research papers"`},
      {n:3,title:"Read and Take Notes",time:"Days 3–5",
       desc:"Read each paper's abstract, introduction, and conclusion. Take notes in a doc: what did they find? What methods did they use? What did they NOT answer? Look for patterns and disagreements across papers.",
       claude:`"I'm reading a paper on ${title} and I don't understand this section: [paste the text]. Can you explain it simply?"`,
       youtube:`"How to read a scientific paper quickly and effectively"`},
      {n:4,title:"Synthesize the Evidence",time:"Days 5–6",
       desc:"Group your notes by theme, not by paper. What do most papers agree on? Where is there conflict? What gaps exist? This is the hard, valuable thinking — you're becoming an expert now.",
       claude:`"I've read 8 papers on ${title}. Help me identify the main themes and disagreements across them: [paste your notes]"`,
       youtube:`"How to synthesize sources for a literature review"`},
      {n:5,title:"Write the Review",time:"Week 2",
       desc:"Structure: introduction (define the question and why it matters), body (organized by theme, not by paper), conclusion (what does the evidence say? what's still unknown?), references. Aim for 800–1200 words.",
       claude:`"Read my literature review introduction and tell me if it clearly defines the scope and why it matters: [paste intro]"`,
       youtube:`"How to write a literature review structure and format"`},
      {n:6,title:"Get Feedback",time:"Week 2–3",
       desc:"Share your review with a teacher, parent, or anyone who will read it critically. Does your argument hold? Does each section connect? Revise based on feedback. Then publish it somewhere — even a personal blog.",
       claude:`"Here is my literature review on ${title}: [paste draft]. What are the weakest points in my argument?"`,
       youtube:`"How to revise and improve academic writing"`},
    ],schedule:calcSchedule(project?.timeHours||12,hpw)},

    idea:{steps:[
      {n:1,title:"Find the Gap",time:"Day 1–2",
       desc:"Read about what's already been done in your area. Where do researchers say 'more work is needed'? What question has never been asked? Look for the frontier — the edge of what's known. That's where your idea lives.",
       claude:`"What are the biggest open questions and unexplored areas in ${title}? Where do scientists say more research is needed?"`,
       youtube:`"How to find a research gap in science"`},
      {n:2,title:"Form Your Hypothesis",time:"Day 2–3",
       desc:"A hypothesis is a specific, testable prediction: 'If X, then Y, because Z.' Write yours. It must be falsifiable — meaning someone could prove it wrong with data. Bad hypotheses can't be disproven. Good ones can.",
       claude:`"Help me turn my idea about ${title} into a specific, testable hypothesis. My rough idea is: [describe your idea]."`,
       youtube:`"How to write a scientific hypothesis"`},
      {n:3,title:"Design the Methodology",time:"Days 3–4",
       desc:"How would you test your hypothesis if you had the resources? Describe the experiment or study: what would you measure? How many participants/samples? What controls would you use? What tools would you need?",
       claude:`"Help me design a methodology for testing my hypothesis about ${title}: [state your hypothesis]. What would be the ideal experiment?"`,
       youtube:`"How to design a scientific experiment methodology"`},
      {n:4,title:"Consider the Challenges",time:"Day 4–5",
       desc:"Every good idea has obstacles. What are yours? Cost? Ethics? Technology limits? Time? Write them down honestly. Then write how you might work around each one. This is what separates a dream from a plan.",
       claude:`"What are the biggest practical and ethical challenges in testing this hypothesis about ${title}? [describe your methodology]"`,
       youtube:`"Research limitations and how to address them"`},
      {n:5,title:"Write Your Proposal",time:"Week 2",
       desc:"Structure: background (why this matters), hypothesis, methodology, expected results, potential impact. Aim for 600–1000 words. This is the format real scientists use when applying for grants.",
       claude:`"Review my research proposal for ${title} and tell me what's missing or unclear: [paste your draft]"`,
       youtube:`"How to write a research proposal"`},
      {n:6,title:"Share and Defend It",time:"Week 2–3",
       desc:"Share your proposal with someone and let them ask hard questions. Can you defend your hypothesis? Can you explain why your methodology would work? Being challenged makes your thinking sharper.",
       claude:`"Someone challenged my research idea on ${title} with this objection: [paste objection]. Help me respond to it."`,
       youtube:`"How to present and defend a research idea"`},
    ],schedule:calcSchedule(project?.timeHours||18,hpw)},
  };
  return g[type];
}


// ══════════════════════════════════════════════════════
//  CUSTOM ICON SYSTEM
// ══════════════════════════════════════════════════════
const ICONS = {
  neural: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <circle cx="2.5" cy="4.5" r="1.4" fill={c}/>
      <circle cx="13.5" cy="4.5" r="1.4" fill={c}/>
      <circle cx="2.5" cy="11.5" r="1.4" fill={c}/>
      <circle cx="13.5" cy="11.5" r="1.4" fill={c}/>
      <circle cx="8" cy="8" r="1.7" fill={c}/>
      <line x1="3.7" y1="5.1" x2="6.4" y2="7.1" stroke={c} strokeWidth="1"/>
      <line x1="12.3" y1="5.1" x2="9.6" y2="7.1" stroke={c} strokeWidth="1"/>
      <line x1="3.7" y1="10.9" x2="6.4" y2="8.9" stroke={c} strokeWidth="1"/>
      <line x1="12.3" y1="10.9" x2="9.6" y2="8.9" stroke={c} strokeWidth="1"/>
    </svg>
  ),
  target: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke={c} strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2.2" stroke={c} strokeWidth="1.3"/>
      <line x1="8" y1="1" x2="8" y2="4.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="8" y1="11.5" x2="8" y2="15" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="1" y1="8" x2="4.5" y2="8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="11.5" y1="8" x2="15" y2="8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  chip: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <rect x="4.5" y="4.5" width="7" height="7" rx="1" stroke={c} strokeWidth="1.3"/>
      <line x1="6.5" y1="4.5" x2="6.5" y2="2" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="9.5" y1="4.5" x2="9.5" y2="2" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="6.5" y1="11.5" x2="6.5" y2="14" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="9.5" y1="11.5" x2="9.5" y2="14" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="4.5" y1="6.5" x2="2" y2="6.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="4.5" y1="9.5" x2="2" y2="9.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="11.5" y1="6.5" x2="14" y2="6.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="11.5" y1="9.5" x2="14" y2="9.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="1.3" fill={c}/>
    </svg>
  ),
  chart: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <line x1="2" y1="13.5" x2="14" y2="13.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="2.5" y="8" width="2.5" height="5.5" rx="0.5" fill={c} opacity="0.65"/>
      <rect x="6.5" y="5" width="2.5" height="8.5" rx="0.5" fill={c}/>
      <rect x="10.5" y="2.5" width="2.5" height="11" rx="0.5" fill={c} opacity="0.65"/>
    </svg>
  ),
  dna: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M5 2c2 1.5 4 2.5 4 6s-2 4.5-4 6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M11 2C9 3.5 7 4.5 7 8s2 4.5 4 6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="5.8" y1="5.5" x2="10.2" y2="5.5" stroke={c} strokeWidth="1" opacity="0.8"/>
      <line x1="5" y1="8" x2="11" y2="8" stroke={c} strokeWidth="1" opacity="0.8"/>
      <line x1="5.8" y1="10.5" x2="10.2" y2="10.5" stroke={c} strokeWidth="1" opacity="0.8"/>
    </svg>
  ),
  flask: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M6 2v5L3.2 11.5A1.2 1.2 0 004.3 13h7.4a1.2 1.2 0 001.1-1.5L10 7V2" stroke={c} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/>
      <line x1="5.5" y1="2" x2="10.5" y2="2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M4.5 10.5h7" stroke={c} strokeWidth="1" opacity="0.6"/>
      <circle cx="7" cy="11.5" r="0.7" fill={c} opacity="0.8"/>
      <circle cx="9.5" cy="11" r="0.5" fill={c} opacity="0.6"/>
    </svg>
  ),
  atom: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="1.8" fill={c}/>
      <ellipse cx="8" cy="8" rx="6.5" ry="2.5" stroke={c} strokeWidth="1.2"/>
      <ellipse cx="8" cy="8" rx="6.5" ry="2.5" stroke={c} strokeWidth="1.2" transform="rotate(60 8 8)"/>
      <ellipse cx="8" cy="8" rx="6.5" ry="2.5" stroke={c} strokeWidth="1.2" transform="rotate(120 8 8)"/>
    </svg>
  ),
  rocket: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C6.2 1.5 5 5 5 8h6c0-3-1.2-6.5-3-6.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M5 8v3.5a3 3 0 006 0V8" stroke={c} strokeWidth="1.3"/>
      <path d="M5 9.5L3.5 13" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M11 9.5L12.5 13" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="8" cy="6.5" r="1" fill={c}/>
    </svg>
  ),
  satellite: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <rect x="6" y="6" width="4" height="4" rx="0.8" stroke={c} strokeWidth="1.3"/>
      <line x1="2" y1="8" x2="6" y2="8" stroke={c} strokeWidth="1.2"/>
      <line x1="10" y1="8" x2="14" y2="8" stroke={c} strokeWidth="1.2"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="1.2"/>
      <line x1="8" y1="10" x2="8" y2="14" stroke={c} strokeWidth="1.2"/>
      <rect x="1" y="6.8" width="2.2" height="2.4" rx="0.4" fill={c} opacity="0.7"/>
      <rect x="12.8" y="6.8" width="2.2" height="2.4" rx="0.4" fill={c} opacity="0.7"/>
    </svg>
  ),
  planet: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="4" stroke={c} strokeWidth="1.3"/>
      <ellipse cx="8" cy="8" rx="7.5" ry="2.5" stroke={c} strokeWidth="1.2" transform="rotate(-20 8 8)"/>
    </svg>
  ),
  lock: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <rect x="3" y="8" width="10" height="7" rx="1.2" stroke={c} strokeWidth="1.3"/>
      <path d="M5.5 8V6.5a2.5 2.5 0 015 0V8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="12" r="1.2" fill={c}/>
      <line x1="8" y1="12" x2="8" y2="13.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  crystal: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <polygon points="8,2 14,7 8,14 2,7" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="2" y1="7" x2="14" y2="7" stroke={c} strokeWidth="1" opacity="0.7"/>
      <line x1="8" y1="2" x2="5" y2="7" stroke={c} strokeWidth="1" opacity="0.55"/>
      <line x1="8" y1="2" x2="11" y2="7" stroke={c} strokeWidth="1" opacity="0.55"/>
    </svg>
  ),
  trend: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <polyline points="2,12 5,8 9,5 14,2" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="14" cy="2" r="1.6" fill={c}/>
      <line x1="2" y1="14" x2="14" y2="14" stroke={c} strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
    </svg>
  ),
  leaf: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M13 3C8 3 3 8 3 13c2-1 6-2 7-7 0 2.5 0 5.5 0 7 0-5 3-9 3-10z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill={c} opacity="0.12"/>
      <path d="M13 3C8 3 3 8 3 13c2-1 6-2 7-7 0 2.5 0 5.5 0 7 0-5 3-9 3-10z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="3" y1="13" x2="8" y2="8" stroke={c} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  bolt: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <polyline points="11,2 7,9 10,9 5,14" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  note: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <line x1="6.5" y1="12" x2="6.5" y2="5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="10.5" y1="11" x2="10.5" y2="4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6.5" y1="5" x2="10.5" y2="4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <ellipse cx="5" cy="12.5" rx="2" ry="1.3" stroke={c} strokeWidth="1.2" transform="rotate(-10 5 12.5)"/>
      <ellipse cx="9" cy="11.5" rx="2" ry="1.3" stroke={c} strokeWidth="1.2" transform="rotate(-10 9 11.5)"/>
    </svg>
  ),
  controller: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M2.5 7h11a2.5 2.5 0 010 5h-11a2.5 2.5 0 010-5z" stroke={c} strokeWidth="1.3"/>
      <line x1="5.5" y1="8.5" x2="5.5" y2="10.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="4.5" y1="9.5" x2="6.5" y2="9.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="10.5" cy="8.8" r="0.75" fill={c}/>
      <circle cx="12.2" cy="10" r="0.75" fill={c}/>
    </svg>
  ),
  bulb: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M8 2a4 4 0 014 4c0 2-1.2 3.3-2.2 4.3V12H6.2V10.3C5.2 9.3 4 8 4 6a4 4 0 014-4z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="6.2" y1="13" x2="9.8" y2="13" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6.7" y1="14.4" x2="9.3" y2="14.4" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="8" y1="4.5" x2="8" y2="7.5" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.55"/>
    </svg>
  ),
  book: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M2 3v10c0 0 2-1 6-1s6 1 6 1V3c0 0-2-1-6-1S2 3 2 3z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="8" y1="2.5" x2="8" y2="12.5" stroke={c} strokeWidth="1"/>
      <line x1="4" y1="6" x2="7.5" y2="6" stroke={c} strokeWidth="1" opacity="0.6"/>
      <line x1="4" y1="8.5" x2="7.5" y2="8.5" stroke={c} strokeWidth="1" opacity="0.6"/>
      <line x1="8.5" y1="6" x2="12" y2="6" stroke={c} strokeWidth="1" opacity="0.6"/>
      <line x1="8.5" y1="8.5" x2="12" y2="8.5" stroke={c} strokeWidth="1" opacity="0.6"/>
    </svg>
  ),
  spark: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <line x1="8" y1="2" x2="8" y2="14" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2" y1="8" x2="14" y2="8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="4.3" y1="4.3" x2="11.7" y2="11.7" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.65"/>
      <line x1="11.7" y1="4.3" x2="4.3" y2="11.7" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.65"/>
    </svg>
  ),
  scope: (c,s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <line x1="8" y1="1.5" x2="8" y2="8" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.65"/>
      <rect x="6" y="7" width="4" height="3" rx="0.5" stroke={c} strokeWidth="1.3"/>
      <line x1="3" y1="13.5" x2="13" y2="13.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="8" y1="10" x2="8" y2="13.5" stroke={c} strokeWidth="1.3"/>
      <line x1="5" y1="13.5" x2="5" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

const EMOJI_ICON = {
  "🧠":"neural","🤖":"chip","💬":"chip","📊":"chart","🎯":"target",
  "📚":"book","🖼️":"spark","✂️":"scope","🧬":"dna","⚙️":"atom",
  "🔬":"scope","🧪":"flask","💊":"crystal","📈":"trend","📉":"trend",
  "🌬️":"bolt","🔋":"bolt","💧":"leaf","🌱":"leaf","⚡":"bolt",
  "☀️":"spark","🌡️":"chart","🚀":"rocket","🛰️":"satellite","🌕":"planet",
  "🛸":"rocket","🌍":"planet","🪐":"planet","✨":"spark","⚛️":"atom",
  "🔐":"lock","🛠️":"target","🔮":"crystal","🎲":"crystal","🔍":"target",
  "🔑":"lock","🏦":"chart","🏛️":"lock","💎":"crystal","🌾":"leaf",
  "💼":"book","⚖️":"target","📰":"book","🎨":"spark","🖌️":"spark",
  "🎵":"note","🎹":"note","🎮":"controller","👾":"controller",
  "⚽":"spark","🏃":"bolt","🤝":"target","📢":"bolt","🌿":"leaf",
  "🦋":"leaf","💡":"bulb","🏆":"crystal","📝":"book","📖":"book",
  "🎓":"book",
};

function Glyph({emoji, color="currentColor", size=20}) {
  const key = EMOJI_ICON[emoji] || "spark";
  const fn  = ICONS[key];
  return fn ? fn(color, size) : <span style={{fontSize:size*0.75,lineHeight:1}}>{emoji}</span>;
}


// ══════════════════════════════════════════════════════
//  DESIGN ATOMS
// ══════════════════════════════════════════════════════
const TAG_CFG = {
  trending:    {label:"TRENDING",    color:"#fb7185"},
  hot:         {label:"HOT",        color:"#f5a623"},
  essential:   {label:"ESSENTIAL",  color:"#67e8f9"},
  recommended: {label:"RECOMMENDED",color:"#a78bfa"},
};
function Tag({type}) {
  const t=TAG_CFG[type]; if(!t) return null;
  return (
    <span style={{fontFamily:FM,fontSize:"9px",color:t.color,
      background:`${t.color}13`,border:`1px solid ${t.color}2e`,
      padding:"2px 7px",borderRadius:3,letterSpacing:"0.8px",
      display:"inline-flex",alignItems:"center",whiteSpace:"nowrap",lineHeight:1.8}}>
      {t.label}
    </span>
  );
}
function DiffBar({level,max=5}) {
  const cols=["#3effa0","#3effa0","#f5a623","#f5a623","#fb7185"];
  return (
    <span style={{display:"inline-flex",gap:3,alignItems:"center"}}>
      {Array.from({length:max}).map((_,i)=>(
        <span key={i} style={{width:10,height:2,borderRadius:1,
          background:i<level?cols[Math.min(i,cols.length-1)]:"rgba(255,255,255,0.1)"}}/>
      ))}
    </span>
  );
}
function Divider({my=24}) {
  return <div style={{height:1,background:C.border,margin:`${my}px 0`}}/>;
}
function SectionLabel({text,color=C.textMuted}) {
  return (
    <div style={{fontFamily:FM,fontSize:"10px",color,letterSpacing:"2.5px",
      marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <span style={{display:"inline-block",width:20,height:1,background:color,opacity:0.5}}/>
      {text}
    </div>
  );
}

// ── Grain texture overlay ──────────────────────────────
function GrainOverlay() {
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.042'/%3E%3C/svg%3E")`,
      backgroundRepeat:"repeat",
    }}/>
  );
}

// ── Momentum bar — white with blue phosphor glow ───────
function MomentumBar({momentum, surging}) {
  const isEmpty = momentum <= 0;
  const pct = Math.max(0,Math.min(100,momentum));
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,height:8,
      background:"rgba(255,255,255,0.025)",zIndex:300}}>
      <div style={{
        height:"100%",
        width:`${pct}%`,
        background: isEmpty
          ? "#fb7185"
          : "rgba(255,255,255,0.9)",
        boxShadow: isEmpty
          ? "0 0 16px rgba(251,113,133,0.7)"
          : "0 0 24px rgba(96,165,250,0.65), 0 0 50px rgba(59,130,246,0.28), 0 0 4px rgba(255,255,255,0.8)",
        transition:"width 0.65s cubic-bezier(0.34,1.56,0.64,1), background 0.4s, box-shadow 0.4s",
        animation: isEmpty ? "pulseRed 0.9s ease-in-out" : surging ? "surgeGlow 0.5s ease-out" : "none",
      }}/>
    </div>
  );
}

// ── Glass card ─────────────────────────────────────────
function GlassCard({children,selected,accent=C.green,onClick,style={}}) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        position:"relative",
        background: selected ? `rgba(${rgbOf(accent)},0.07)` : hov ? C.surfaceHov : C.surface,
        border:`1px solid ${selected?`${accent}44`:hov?C.borderHov:C.border}`,
        borderRadius:8,padding:20,cursor:onClick?"pointer":"default",
        backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
        transition:"all 0.15s ease-out",
        boxShadow:selected?`0 0 0 1px ${accent}18, 0 8px 32px rgba(0,0,0,0.5)`:"0 2px 12px rgba(0,0,0,0.25)",
        animation:"fadeUp 0.25s ease-out",...style}}>
      {children}
    </div>
  );
}

// ── Button ─────────────────────────────────────────────
function Btn({children,onClick,variant="primary",size="md",disabled=false}) {
  const [hov,setHov]=useState(false);
  const SZ={sm:{fontSize:11,padding:"6px 14px"},md:{fontSize:13,padding:"10px 20px"},lg:{fontSize:14,padding:"12px 26px"},xl:{fontSize:15,padding:"14px 32px"}}[size]||{fontSize:13,padding:"10px 20px"};
  const VS={
    primary:{background:hov&&!disabled?`linear-gradient(135deg,rgba(255,255,255,1),rgba(210,232,255,0.95))`:"rgba(255,255,255,0.9)",color:"#0d0e10",border:"none",boxShadow:hov?"0 0 28px rgba(96,165,250,0.45), 0 0 10px rgba(255,255,255,0.2)":"0 0 16px rgba(96,165,250,0.2)"},
    secondary:{background:hov?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.04)",color:C.text,border:`1px solid ${hov?C.borderHov:C.border}`,boxShadow:"none"},
    ghost:{background:"transparent",color:hov?C.text:C.textDim,border:"none",boxShadow:"none"},
  }[variant];
  return (
    <button onClick={disabled?undefined:onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{...VS,...SZ,fontFamily:FM,fontWeight:600,
        borderRadius:6,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.38:1,
        transition:"all 0.18s ease-out",letterSpacing:"0.3px",
        display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8}}>
      {children}
    </button>
  );
}

// ── Sidebar icons ──────────────────────────────────────
const FocusIcon  = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><line x1="8" y1="1" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="8" y1="11.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="1" y1="8" x2="4.5" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="11.5" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const BuildIcon  = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>;
const MapIcon    = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 3.5L6 2l4 2 4-1.5v11L10 15l-4-2-4 1.5V3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 2v11M10 4v11" stroke="currentColor" strokeWidth="1" opacity="0.5"/></svg>;
const GuideIcon  = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M6 6h4M6 9h4M6 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/></svg>;
const ResetIcon  = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 105-5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M3 4v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ── Sidebar ────────────────────────────────────────────
const SCREEN_ORDER = ["intro","input","results","guide"];
const NAV_ITEMS = [
  {id:"intro",   label:"FOCUS",   Icon:FocusIcon},
  {id:"input",   label:"BUILD",   Icon:BuildIcon},
  {id:"results", label:"ROADMAP", Icon:MapIcon},
  {id:"guide",   label:"GUIDE",   Icon:GuideIcon},
];

function Sidebar({open, onEnter, onLeave, screen, onNav, onReset}) {
  const curIdx = SCREEN_ORDER.indexOf(screen);
  return (
    <div className={open?"sb-open":""} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{position:"fixed",left:0,top:0,bottom:0,width:open?210:56,background:C.rail,
        borderRight:`1px solid ${C.border}`,zIndex:200,
        transition:"width 0.15s cubic-bezier(0.4,0,0.2,1)",
        display:"flex",flexDirection:"column",padding:"18px 0 16px",overflow:"hidden"}}>

      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:12,
        padding:"0 13px 20px",borderBottom:`1px solid ${C.border}`,marginBottom:12}}>
        <img src={TKS_LOGO} alt="TKS" style={{width:28,height:28,borderRadius:6,objectFit:"cover",flexShrink:0}}/>
        <span className="sbl sbl-logo" style={{fontFamily:FM,fontSize:10,color:C.textDim,fontWeight:600,letterSpacing:"3px"}}>TKS</span>
      </div>

      {/* Nav items */}
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:2,padding:"0 8px"}}>
        {NAV_ITEMS.map(({id,label,Icon},i)=>{
          const isActive=screen===id;
          const isDone=i<curIdx;
          const locked=i>curIdx+1||(i===curIdx+1&&curIdx===-1);
          return (
            <button key={id} onClick={()=>!locked&&onNav(id)}
              style={{display:"flex",alignItems:"center",gap:14,padding:"9px 11px",borderRadius:6,
                background:isActive?"rgba(255,255,255,0.07)":"transparent",
                border:isActive?`1px solid ${C.borderHov}`:"1px solid transparent",
                color:isActive?C.text:isDone?C.textDim:locked?C.textMuted:C.textDim,
                opacity:locked?0.3:1,cursor:locked?"default":"pointer",
                transition:"all 0.12s",whiteSpace:"nowrap",overflow:"hidden"}}>
              <span style={{flex:"0 0 16px",display:"flex",justifyContent:"center"}}><Icon/></span>
              <span className="sbl" style={{fontFamily:FM,fontSize:"10px",letterSpacing:"1.8px",fontWeight:isActive?600:400}}>{label}</span>
              {isDone&&<span className="sbl" style={{marginLeft:"auto",fontSize:9,color:C.green,opacity:0.8}}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Reset */}
      <div style={{padding:"12px 8px 0",borderTop:`1px solid ${C.border}`}}>
        <button onClick={onReset}
          style={{display:"flex",alignItems:"center",gap:14,padding:"9px 11px",borderRadius:6,
            width:"100%",border:"1px solid transparent",color:C.textMuted,background:"transparent",
            transition:"all 0.12s",whiteSpace:"nowrap",overflow:"hidden"}}
          onMouseEnter={e=>{e.currentTarget.style.color=C.textDim;e.currentTarget.style.background="rgba(255,255,255,0.04)";}}
          onMouseLeave={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.background="transparent";}}>
          <span style={{flex:"0 0 16px",display:"flex",justifyContent:"center"}}><ResetIcon/></span>
          <span className="sbl" style={{fontFamily:FM,fontSize:"9px",letterSpacing:"1.5px"}}>NEW ROADMAP</span>
        </button>
      </div>
    </div>
  );
}

// ── Ghost title ────────────────────────────────────────
const GHOST_TITLES = {intro:"TKS FOCUS BUILDER",input:"CONFIGURE ROADMAP",results:"PROJECT ROADMAP",guide:"YOUR GUIDE"};
function GhostTitle({screen}) {
  return (
    <div style={{fontFamily:FM,fontSize:11,color:"rgba(255,255,255,0.26)",
      letterSpacing:"3px",marginBottom:44,userSelect:"none",animation:"fadeUp 0.4s ease-out"}}>
      {GHOST_TITLES[screen]||"TKS"}
    </div>
  );
}


// ══════════════════════════════════════════════════════
//  GENERATING SCREEN
// ══════════════════════════════════════════════════════
function GeneratingScreen({topic, error}) {
  const [frame, setFrame] = useState(0);
  const frames = ["▪  ▫  ▫","▫  ▪  ▫","▫  ▫  ▪","▫  ▪  ▫"];
  const phases = [
    "Analyzing your focus area…",
    "Researching cutting-edge projects…",
    "Personalizing to your interests…",
    "Crafting your roadmap…",
  ];

  useEffect(() => {
    if(error) return;
    const id = setInterval(() => setFrame(f => (f + 1) % frames.length), 480);
    return () => clearInterval(id);
  }, [error]);

  return (
    <div style={{maxWidth:520, margin:"0 auto", animation:"fadeUp 0.35s ease-out"}}>
      {error ? (
        <div>
          <div style={{fontFamily:FM,fontSize:11,color:C.rose,letterSpacing:"3px",marginBottom:20}}>
            API ERROR
          </div>
          <h2 style={{fontFamily:FM,fontSize:22,color:C.text,marginBottom:16,letterSpacing:"-0.5px"}}>
            Could not reach Claude
          </h2>
          <div style={{fontFamily:FM,fontSize:11,color:C.textDim,lineHeight:1.7,
            background:C.surface,border:`1px solid ${C.rose}33`,borderRadius:8,
            padding:"14px 18px",marginBottom:24}}>
            {error}
          </div>
          <p style={{fontFamily:F,fontSize:13,color:C.textMuted,lineHeight:1.65}}>
            Production: set <code style={{color:C.blue}}>ANTHROPIC_API_KEY</code> on the server (Vercel → Environment Variables) and redeploy — or use{" "}
            <code style={{color:C.blue}}>VITE_ANTHROPIC_API_KEY</code> for browser calls. Local: <code style={{color:C.blue}}>.env</code> + restart{" "}
            <code style={{color:C.blue}}>npm run dev</code>. Falling back to local content…
          </p>
        </div>
      ) : (
        <div>
          {/* Animated orb */}
          <div style={{width:64,height:64,borderRadius:"50%",marginBottom:36,
            background:"radial-gradient(circle at 35% 35%, rgba(96,165,250,0.35), rgba(96,165,250,0.04))",
            border:`1px solid rgba(96,165,250,0.28)`,
            boxShadow:"0 0 32px rgba(96,165,250,0.18), 0 0 64px rgba(96,165,250,0.08)",
            display:"flex",alignItems:"center",justifyContent:"center",
            animation:"cardFloat 2s ease-in-out infinite"}}>
            <div style={{fontFamily:FM,fontSize:13,color:C.blue,letterSpacing:"3px"}}>
              {frames[frame]}
            </div>
          </div>

          <h2 style={{fontFamily:FM,fontSize:"clamp(18px,3vw,24px)",fontWeight:600,
            color:C.text,letterSpacing:"-0.4px",lineHeight:1.3,marginBottom:10}}>
            Building your roadmap
          </h2>
          <p style={{fontFamily:F,fontSize:14,color:C.textDim,lineHeight:1.7,marginBottom:36,maxWidth:400}}>
            Crafting a personalized plan for{" "}
            <span style={{color:C.text,fontFamily:FM,fontSize:12}}>{topic}</span>
          </p>

          <div style={{fontFamily:FM,fontSize:11,color:C.textMuted,letterSpacing:"1.5px",
            animation:"fadeIn 0.5s 0.3s ease-out both"}}>
            {phases[frame % phases.length]}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  INTRO SCREEN
// ══════════════════════════════════════════════════════
function IntroScreen({onStart}) {
  const scanOverlay = {
    position:"absolute",
    inset:0,
    pointerEvents:"none",
    borderRadius:4,
    backgroundImage:`repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.14) 2px, rgba(0,0,0,0.14) 3px)`,
    mixBlendMode:"multiply",
  };
  return (
    <div style={{maxWidth:560,margin:"0 auto",animation:"fadeUp 0.35s ease-out",textAlign:"center"}}>
      <div style={{fontFamily:FM,fontSize:11,color:C.blue,letterSpacing:"3px",marginBottom:22,opacity:0.9}}>
        MOMENTUM EDITION
      </div>

      {/* Hero title — bold sans, dotted frame, CRT-style scan lines */}
      <div style={{
        display:"inline-block",
        maxWidth:"100%",
        padding:"clamp(28px,5vw,40px) clamp(36px,6vw,56px)",
        marginBottom:32,
        border:"2px dotted rgba(255,255,255,0.9)",
        borderRadius:22,
        background:"rgba(13,14,16,0.42)",
        backdropFilter:"blur(10px)",
        WebkitBackdropFilter:"blur(10px)",
        boxShadow:`0 0 0 1px rgba(255,255,255,0.06), 0 0 72px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}>
        <div style={{position:"relative",display:"inline-block",textAlign:"center"}}>
          <h1 style={{
            fontFamily:F_HERO,
            fontSize:"clamp(36px, 7vw, 58px)",
            fontWeight:800,
            color:"#fff",
            lineHeight:1.12,
            margin:0,
            letterSpacing:"-0.05em",
            textShadow:"0 1px 0 rgba(0,0,0,0.35)",
          }}>
            Build your TKS<br/>
            <span style={{color:"rgba(255,255,255,0.52)"}}>focus roadmap.</span>
          </h1>
          <div aria-hidden style={scanOverlay}/>
        </div>
      </div>

      <p style={{fontFamily:F,fontSize:16,color:C.textDim,lineHeight:1.7,maxWidth:440,margin:"0 auto 40px",textAlign:"center"}}>
        Tell us your focus topic and interests. Get a personalized set of articles,
        replication projects, and original ideas — with step-by-step guides for each.
      </p>

      <Btn onClick={onStart} size="xl">INITIALIZE ROADMAP →</Btn>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  INPUT SCREEN — step-by-step wizard
// ══════════════════════════════════════════════════════
const WIZARD_STEPS = [
  {id:"topic",   label:"What's your focus topic?",       hint:"The area you're building deep expertise in",            placeholder:"e.g. AI, biotech, climate tech, quantum…", multiline:false, type:"text"},
  {id:"hours",   label:"Hours per week?",                hint:"How much time you can realistically commit each week",  placeholder:"e.g. 5",                                    multiline:false, type:"number"},
  {id:"interests",label:"What do you care about?",      hint:"Outside of tech — the more honest, the more personal the roadmap",placeholder:"e.g. music, gaming, social impact, business…",multiline:true},
];

function InputScreen({onSubmit}) {
  const [track,setTrack]=useState(null);
  const [stepIdx,setStepIdx]=useState(0);
  const [values,setValues]=useState({topic:"",hours:"",interests:""});
  const [exiting,setExiting]=useState(false);
  const inputRef=useRef(null);

  useEffect(()=>{
    if(track&&inputRef.current){
      const timer=setTimeout(()=>{inputRef.current.focus();},80);
      return ()=>clearTimeout(timer);
    }
  },[stepIdx,track]);

  // Auto-height multiline field so the underline hugs the text (not a fixed rows={4} gap).
  useEffect(()=>{
    if(!track)return;
    const el=inputRef.current;
    if(!el||el.nodeName!=="TEXTAREA")return;
    el.style.height="auto";
    el.style.height=`${el.scrollHeight}px`;
  },[track,stepIdx,values,exiting]);

  // ── Track picker (shown before wizard steps) ──────────────────────────────
  if(!track){
    const opts=[
      {key:"technology",label:"Technology",icon:"chip",
       desc:"Build software projects, apps, and tools. You'll get articles to write, two replication projects to build, and a creative original idea.",
       accent:C.blue},
      {key:"science",label:"Science",icon:"flask",
       desc:"Explore scientific topics deeply. You'll get articles to write, a hands-on experiment, a literature review, and an original research idea.",
       accent:C.green},
    ];
    return (
      <div style={{maxWidth:560,margin:"0 auto",animation:"fadeUp 0.3s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
          <div style={{fontFamily:FM,fontSize:11,color:C.textMuted,letterSpacing:"2px"}}>
            1&nbsp;/&nbsp;{WIZARD_STEPS.length + 1}
          </div>
          <div style={{flex:1,height:1,background:`linear-gradient(to right,${C.border},transparent)`}}/>
        </div>
        <h2 style={{fontFamily:FM,fontSize:"clamp(20px,3vw,26px)",fontWeight:600,
          color:C.text,letterSpacing:"-0.4px",lineHeight:1.3,marginBottom:10}}>
          Choose your track
        </h2>
        <p style={{fontFamily:F,fontSize:14,color:C.textMuted,lineHeight:1.6,marginBottom:36}}>
          This shapes the type of projects and work you'll take on.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {opts.map(opt=>(
            <button key={opt.key} onClick={()=>setTrack(opt.key)}
              style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,
                padding:"24px 22px",cursor:"pointer",textAlign:"left",
                backdropFilter:"blur(12px)",transition:"all 0.15s",position:"relative",overflow:"hidden"}}
              onMouseEnter={e=>{
                e.currentTarget.style.borderColor=opt.accent+"55";
                e.currentTarget.style.background=`rgba(${rgbOf(opt.accent)},0.07)`;
                e.currentTarget.style.transform="translateY(-2px)";
                e.currentTarget.style.boxShadow=`0 8px 28px rgba(0,0,0,0.35),0 0 0 1px ${opt.accent}22`;
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.borderColor=C.border;
                e.currentTarget.style.background=C.surface;
                e.currentTarget.style.transform="none";
                e.currentTarget.style.boxShadow="none";
              }}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,
                background:opt.accent,opacity:0.6,borderRadius:"12px 12px 0 0"}}/>
              <div style={{marginBottom:16,lineHeight:0,display:"flex",alignItems:"center"}}>
                {ICONS[opt.icon](opt.accent, 36)}
              </div>
              <div style={{fontFamily:FM,fontSize:15,fontWeight:700,color:C.text,
                marginBottom:10,letterSpacing:"-0.3px"}}>{opt.label}</div>
              <div style={{fontFamily:F,fontSize:12,color:C.textMuted,lineHeight:1.65}}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const step=WIZARD_STEPS[stepIdx];
  const fieldPlaceholder=
    step.id==="topic"
      ? (track==="science"
          ? "eg. Biotech, Nuclear Fusion, Cellular Agriculture..."
          : "eg. AI, Blockchain, Quantum Computer, BCIs...")
      : step.placeholder;
  const val=values[step.id]||"";
  const isLast=stepIdx===WIZARD_STEPS.length-1;
  const canAdvance=val.trim().length>0&&(step.type!=="number"||!isNaN(parseInt(val)));

  function advance(){
    if(!canAdvance)return;
    if(isLast){
      onSubmit(values.topic,values.hours,values.interests,track);
      return;
    }
    setExiting(true);
    setTimeout(()=>{setStepIdx(s=>s+1);setExiting(false);},250);
  }

  function handleKey(e){
    if(step.multiline&&e.key==="Enter"&&!e.shiftKey){e.preventDefault();advance();}
    else if(!step.multiline&&e.key==="Enter"){advance();}
  }

  const pct=((stepIdx+1)/(WIZARD_STEPS.length+1))*100;

  return (
    <div style={{maxWidth:560,margin:"0 auto",animation:"fadeUp 0.3s ease-out"}}>

      {/* Progress strip */}
      <div style={{height:2,background:C.border,borderRadius:1,marginBottom:52,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct+(100/WIZARD_STEPS.length)}%`,
          background:"rgba(255,255,255,0.8)",
          boxShadow:"0 0 12px rgba(96,165,250,0.5)",
          transition:"width 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      </div>

      {/* Step content */}
      <div style={{animation:exiting?"slideOutLeft 0.22s ease-in both":"slideInRight 0.28s ease-out both"}}>

        {/* Counter */}
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
          <div style={{fontFamily:FM,fontSize:11,color:C.textMuted,letterSpacing:"2px"}}>
            {stepIdx + 2}&nbsp;/&nbsp;{WIZARD_STEPS.length + 1}
          </div>
          <div style={{flex:1,height:1,background:`linear-gradient(to right,${C.border},transparent)`}}/>
        </div>

        {/* Question */}
        <h2 style={{fontFamily:FM,fontSize:"clamp(20px,3vw,26px)",fontWeight:600,
          color:C.text,letterSpacing:"-0.4px",lineHeight:1.3,marginBottom:10}}>
          {step.label}
        </h2>
        <p style={{fontFamily:F,fontSize:14,color:C.textMuted,lineHeight:1.6,marginBottom:36}}>
          {step.hint}
        </p>

        {/* Input */}
        <div style={{position:"relative",marginBottom:32}}>
          {step.multiline
            ? <textarea ref={inputRef} value={val}
                onChange={e=>setValues(v=>({...v,[step.id]:e.target.value}))}
                onKeyDown={handleKey} placeholder={fieldPlaceholder} rows={1}
                style={{width:"100%",fontFamily:F,fontSize:17,color:C.text,lineHeight:1.6,
                  background:"transparent",border:"none",borderBottom:`1.5px solid ${val?C.text:C.border}`,
                  padding:"4px 0 8px",transition:"border-color 0.2s",resize:"none",
                  overflow:"hidden",minHeight:0,boxSizing:"border-box"}}/>
            : <input ref={inputRef} type={step.type||"text"} value={val}
                onChange={e=>setValues(v=>({...v,[step.id]:e.target.value}))}
                onKeyDown={handleKey} placeholder={fieldPlaceholder}
                style={{width:"100%",fontFamily:F,fontSize:22,color:C.text,lineHeight:1.4,
                  background:"transparent",border:"none",borderBottom:`1.5px solid ${val?C.text:C.border}`,
                  padding:"4px 0 12px",transition:"border-color 0.2s"}}/>
          }
          {/* blinking cursor indicator */}
          {!val&&(
            <span style={{position:"absolute",bottom:12,left:0,width:2,height:step.multiline?18:26,
              background:C.textMuted,display:"inline-block",
              animation:"blinkCursor 1.1s ease-in-out infinite"}}/>
          )}
        </div>

        {/* Advance button + keyboard hint */}
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <Btn onClick={advance} disabled={!canAdvance} size="lg">
            {isLast?"GENERATE ROADMAP →":("CONTINUE →")}
          </Btn>
          <span style={{fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"1px"}}>
            {step.multiline?"SHIFT+ENTER FOR NEW LINE · ENTER TO CONTINUE":"PRESS ENTER"}
          </span>
        </div>
      </div>

      {/* Previously answered (above fold context) */}
      {stepIdx>0&&(
        <div style={{marginTop:56,paddingTop:28,borderTop:`1px solid ${C.border}`}}>
          {WIZARD_STEPS.slice(0,stepIdx).map(s=>(
            <div key={s.id} style={{display:"flex",gap:16,marginBottom:12,animation:"fadeIn 0.3s ease-out"}}>
              <span style={{fontFamily:FM,fontSize:9,color:C.textMuted,letterSpacing:"1.5px",
                paddingTop:2,flexShrink:0,minWidth:70}}>{s.id.toUpperCase()}</span>
              <span style={{fontFamily:F,fontSize:13,color:C.textDim}}>{values[s.id]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  SELECTABLE CARD (results)
// ══════════════════════════════════════════════════════
function SelectCard({item,selected,accent=C.green,onSelect,index=0}) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onSelect} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        position:"relative",
        background:selected?`rgba(${rgbOf(accent)},0.07)`:hov?C.surfaceHov:C.surface,
        border:`1px solid ${selected?`${accent}44`:hov?C.borderHov:C.border}`,
        borderRadius:8,padding:"16px 18px",cursor:"pointer",
        backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
        transition:"all 0.15s",marginBottom:8,
        boxShadow:selected?`0 0 0 1px ${accent}18,0 8px 28px rgba(0,0,0,0.35)`:"0 2px 12px rgba(0,0,0,0.2)",
        animation:`fadeUp 0.28s ${index*0.05}s ease-out both`}}>

      {selected&&(
        <div style={{position:"absolute",top:14,right:14,width:18,height:18,
          borderRadius:"50%",background:accent,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:9,fontWeight:800,color:"#000"}}>✓</div>
      )}

      {/* Title row */}
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:9,paddingRight:selected?28:0}}>
        <div style={{flexShrink:0,marginTop:1}}>
          <Glyph emoji={item.emoji} color={selected?accent:C.textMuted} size={18}/>
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
            <span style={{fontFamily:F,fontSize:14,fontWeight:700,
              color:selected?accent:C.text,transition:"color 0.15s",lineHeight:1.3}}>
              {item.title}
            </span>
            {item.tag&&<Tag type={item.tag}/>}
          </div>
        </div>
      </div>

      <p style={{fontFamily:F,fontSize:13,color:C.textDim,lineHeight:1.65,
        marginBottom:item.importance?10:0,marginLeft:30}}>
        {item.summary||item.description}
      </p>

      {item.importance&&(
        <div style={{fontFamily:F,fontSize:11,color:C.textMuted,fontStyle:"italic",
          paddingLeft:10,borderLeft:`2px solid ${accent}44`,lineHeight:1.6,marginBottom:10,marginLeft:30}}>
          {item.importance}
        </div>
      )}

      {(item.skills||item.timeHours||item.difficulty!==undefined)&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginTop:4,marginLeft:30}}>
          {item.timeHours&&(
            <span style={{fontFamily:FM,fontSize:10,color:C.textMuted,
              background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,
              padding:"2px 8px",borderRadius:4}}>~{item.timeHours}h</span>
          )}
          {item.difficulty!==undefined&&(
            <span style={{display:"inline-flex",alignItems:"center",gap:6,fontFamily:FM,fontSize:10,color:C.textMuted}}>
              diff <DiffBar level={item.difficulty}/>
            </span>
          )}
          {item.skills&&item.skills.slice(0,3).map(sk=>(
            <span key={sk} style={{fontFamily:FM,fontSize:10,color:C.textMuted,
              background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,
              padding:"2px 8px",borderRadius:4}}>{sk}</span>
          ))}
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════
//  SECTION DEFINITIONS (track-aware)
// ══════════════════════════════════════════════════════
const TECH_SECS = [
  {key:"article",num:"01",label:"ARTICLE",    title:"Research & Write",    desc:"Pick a foundational concept to research and write a blog post about. This builds your knowledge base and communication skills.",accent:"#60A5FA"},
  {key:"rep1",   num:"02",label:"REPLICATE I",title:"Beginner Build",      desc:"Build something that already exists. Learn the tools and get your first win. No prior experience needed.",accent:C.green},
  {key:"rep2",   num:"03",label:"REPLICATE II",title:"Level Up",           desc:"A more ambitious build for after you've completed Replicate I. Apply what you learned and go deeper.",accent:C.amber},
  {key:"create", num:"04",label:"CREATE",     title:"Original Project",    desc:"Build something new — blended with your personal interests. Make it yours.",accent:C.rose},
];
const SCI_SECS = [
  {key:"article",num:"01",label:"ARTICLE",    title:"Research & Write",    desc:"Pick a foundational concept to research and write a blog post about. Build deep conceptual understanding.",accent:"#60A5FA"},
  {key:"apply",  num:"02",label:"APPLY",      title:"Hands-On Experiment", desc:"Do a real experiment or computer simulation you can run at home. No expensive lab equipment needed.",accent:C.green},
  {key:"review", num:"03",label:"REVIEW",     title:"Literature Review",   desc:"Read real research papers and synthesize insights — like a mini PhD review paper on your topic.",accent:C.amber},
  {key:"idea",   num:"04",label:"IDEA",       title:"Novel Idea",          desc:"Design an original experiment, simulation, or research proposal. Something genuinely new.",accent:C.rose},
];
function getSecs(track){return track==="science"?SCI_SECS:TECH_SECS;}

// ══════════════════════════════════════════════════════
//  RESULTS SCREEN
// ══════════════════════════════════════════════════════

function ResultsScreen({content,selections,onSelect,onSubmit,feedback,setFeedback,onRegenerate}) {
  const {articles,rep1,rep2,create,apply,review,idea,label}=content;
  const track=content.track||"technology";
  const secs=getSecs(track);
  const dataMap={article:articles,rep1,rep2,create,apply,review,idea};
  const selectedCount=Object.values(selections).filter(v=>v!==null).length;
  const allSelected=selectedCount===secs.length;

  return (
    <div style={{maxWidth:680,margin:"0 auto",padding:"0 0 80px",animation:"fadeUp 0.3s ease-out",position:"relative",zIndex:1}}>

      <div style={{marginBottom:40}}>
        <SectionLabel text={`ROADMAP · ${label.toUpperCase()}`} color={C.violet}/>
        <h2 style={{fontFamily:FM,fontSize:"clamp(22px,3vw,28px)",fontWeight:700,
          color:C.text,letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:12}}>
          Choose your path
        </h2>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <p style={{fontFamily:F,fontSize:14,color:C.textDim}}>Select one from each section, then build your guides.</p>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {secs.map((s,i)=>{
              const done=selections[s.key]!==null;
              return (
                <div key={s.key} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",
                    background:done?s.accent:C.border,
                    boxShadow:done?`0 0 8px ${s.accent}`:"none",transition:"all 0.25s"}}/>
                  {i<secs.length-1&&<div style={{width:14,height:1,background:C.border}}/>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {secs.map(sec=>(
        <div key={sec.key} style={{marginBottom:44}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <span style={{fontFamily:FM,fontSize:10,color:sec.accent,opacity:0.7,letterSpacing:"1px"}}>{sec.num}</span>
            <SectionLabel text={sec.label} color={sec.accent}/>
          </div>
          <div style={{fontFamily:F,fontSize:13,color:C.textMuted,marginBottom:16,lineHeight:1.6}}>{sec.desc}</div>
          {dataMap[sec.key]?.map((item,i)=>(
            <SelectCard key={item.id||item.title} item={item}
              selected={selections[sec.key]===(item.id||item.title)}
              accent={sec.accent} index={i}
              onSelect={()=>onSelect(sec.key,item.id||item.title)}/>
          ))}
        </div>
      ))}

      <Divider my={32}/>

      <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:40}}>
        <Btn onClick={allSelected?onSubmit:undefined} disabled={!allSelected} size="lg">
          BUILD GUIDES ({selectedCount}/{secs.length}) →
        </Btn>
        {!allSelected&&<span style={{fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"1px"}}>SELECT ALL {secs.length} TO CONTINUE</span>}
      </div>

      <GlassCard>
        <SectionLabel text="FEEDBACK" color={C.textMuted}/>
        <p style={{fontFamily:F,fontSize:13,color:C.textDim,marginBottom:14,lineHeight:1.6}}>
          Not quite right? Tell us what to change and we'll regenerate.
        </p>
        <textarea value={feedback} onChange={e=>setFeedback(e.target.value)}
          placeholder="e.g. Make the projects harder, focus on Python, more business-oriented…"
          rows={3}
          style={{width:"100%",fontFamily:F,fontSize:13,color:C.text,lineHeight:1.6,
            background:"rgba(255,255,255,0.025)",border:`1px solid ${C.border}`,
            borderRadius:6,padding:"10px 14px",marginBottom:14,transition:"border-color 0.15s"}}
          onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.25)"}
          onBlur={e=>e.target.style.borderColor=C.border}/>
        <Btn onClick={onRegenerate} variant="secondary" size="md" disabled={!feedback.trim()}>
          ↺ REGENERATE
        </Btn>
      </GlassCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  PDF EXPORT — downloadable light-mode PDF via html2pdf.js
// ══════════════════════════════════════════════════════
async function exportGuidePDF(project, guide, def, topSkills, diffLevel, diffLabel, hoursPerWeek) {
  // Dynamically load html2pdf.js (bundles html2canvas + jsPDF) from CDN
  if (!window.html2pdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      s.onload  = resolve;
      s.onerror = () => reject(new Error("Could not load html2pdf.js"));
      document.head.appendChild(s);
    });
  }

  const accent = def.accent;
  const esc = (v) => String(v||"")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  // ── HTML fragments ──────────────────────────────────
  const toolsHtml  = (project.tools||[]).map(t =>
    `<span class="pill pa">${esc(t)}</span>`).join("");
  const skillsHtml = topSkills.map(sk =>
    `<span class="pill pn">${esc(sk)}</span>`).join("");
  const diffDots   = [1,2,3].map(d =>
    `<span class="dd ${d<=diffLevel?"dd-on":"dd-off"}"></span>`).join("");

  const steps = guide?.steps || [];
  const stepsHtml = steps.length === 0
    ? `<p class="sd" style="margin-top:4px;">No guide steps are available for this project type.</p>`
    : steps.map((step, i) => {
    const last = i === (steps.length - 1);
    const queries = (step.claude||step.youtube) ? `
      <div class="sq">
        ${step.claude  ? `<div class="q qc"><div class="ql">ASK CLAUDE</div><div class="qt">${esc(step.claude)}</div></div>`  : ""}
        ${step.youtube ? `<div class="q qy"><div class="ql">SEARCH YOUTUBE</div><div class="qt">${esc(step.youtube)}</div></div>` : ""}
      </div>` : "";
    return `
      <div class="step">
        <div class="sl">
          <div class="sn">${String(step.n).padStart(2,"0")}</div>
          ${!last ? '<div class="sc"></div>' : ""}
        </div>
        <div class="sb${last?" sb-last":""}">
          <div class="sh">
            <span class="st">${esc(step.title)}</span>
            <span class="stm">${esc(step.time)}</span>
          </div>
          <p class="sd">${esc(step.desc)}</p>
          ${queries}
        </div>
      </div>`;
  }).join("");

  const schedHtml = guide?.schedule ? `
    <div class="card">
      <div class="lbl">WEEKLY SCHEDULE</div>
      <div class="sm">
        <span class="stot">~${guide.schedule.totalHours}h total</span>
        <span class="swk">· ${guide.schedule.weeks} week${guide.schedule.weeks>1?"s":""} at ${hoursPerWeek}h/wk</span>
      </div>
      <div class="sw">
        ${(guide.schedule.schedule||[]).map(w =>
          `<div class="wc"><div class="wl">WK ${w.week}</div><div class="wh">${w.hours}h</div></div>`
        ).join("")}
      </div>
    </div>` : "";

  // ── CSS ─────────────────────────────────────────────
  const css = `
    *{box-sizing:border-box;margin:0;padding:0;}
    body,.root{font-family:Helvetica,Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:14px;line-height:1.6;}
    .root{width:690px;padding:0 2px;}
    .hdr{display:flex;align-items:center;gap:10px;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid #e5e5e5;}
    .tks{font-size:11px;font-weight:700;letter-spacing:3px;color:#bbb;font-family:monospace;}
    .badge{font-size:9px;font-weight:700;letter-spacing:2px;color:${accent};background:${accent}18;border:1px solid ${accent}44;padding:3px 9px;border-radius:4px;font-family:monospace;}
    .tr{display:flex;align-items:center;gap:11px;margin-bottom:9px;}
    .em{font-size:22px;line-height:1;}
    h1{font-size:19px;font-weight:700;color:#0d0d0d;letter-spacing:-0.3px;line-height:1.25;}
    .dr{display:flex;align-items:center;gap:8px;margin-bottom:20px;}
    .dlbl{font-size:9px;font-weight:700;letter-spacing:1.5px;color:#999;font-family:monospace;}
    .dots{display:flex;gap:4px;}
    .dd{display:inline-block;width:14px;height:5px;border-radius:2px;}
    .dd-on{background:${accent};}
    .dd-off{background:#ddd;}
    .dtxt{font-size:9px;font-weight:700;letter-spacing:1px;color:#999;font-family:monospace;}
    .lbl{font-size:9px;font-weight:700;letter-spacing:2px;color:#999;margin-bottom:9px;text-transform:uppercase;font-family:monospace;}
    .card{background:#f7f7f7;border:1px solid #e6e6e6;border-radius:7px;padding:14px 16px;margin-bottom:13px;}
    .dtxt2{font-size:14px;color:#333;line-height:1.7;}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:20px;}
    .pills{display:flex;flex-wrap:wrap;gap:5px;margin-top:3px;}
    .pill{font-size:11px;font-weight:500;padding:3px 9px;border-radius:4px;font-family:monospace;}
    .pa{color:${accent};background:${accent}14;border:1px solid ${accent}30;}
    .pn{color:#555;background:#efefef;border:1px solid #ddd;}
    .slbl{font-size:9px;font-weight:700;letter-spacing:2px;color:#999;margin-bottom:14px;text-transform:uppercase;font-family:monospace;}
    .step{display:flex;gap:13px;}
    .sl{display:flex;flex-direction:column;align-items:center;flex-shrink:0;}
    .sn{width:26px;height:26px;border-radius:5px;background:${accent}15;border:1px solid ${accent}2e;text-align:center;line-height:26px;font-size:10px;font-weight:700;color:${accent};font-family:monospace;}
    .sc{flex:1;width:1px;margin-top:4px;min-height:18px;background:repeating-linear-gradient(to bottom,#ccc 0,#ccc 4px,transparent 4px,transparent 8px);}
    .sb{flex:1;padding-top:2px;padding-bottom:18px;}
    .sb-last{padding-bottom:0;}
    .sh{display:flex;align-items:center;gap:7px;margin-bottom:5px;flex-wrap:wrap;}
    .st{font-size:14px;font-weight:700;color:#0d0d0d;}
    .stm{font-size:10px;color:#999;background:#efefef;border:1px solid #ddd;padding:2px 7px;border-radius:4px;font-family:monospace;}
    .sd{font-size:13px;color:#444;line-height:1.7;margin-bottom:9px;}
    .sq{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:3px;}
    .q{padding:8px 10px;border-radius:5px;}
    .qc{background:#eff6ff;border:1px solid #bfdbfe;}
    .qy{background:#fff1f2;border:1px solid #fecdd3;}
    .ql{font-size:9px;font-weight:700;letter-spacing:1.5px;margin-bottom:4px;font-family:monospace;}
    .qc .ql{color:#3b82f6;}
    .qy .ql{color:#f43f5e;}
    .qt{font-size:11px;color:#555;line-height:1.5;font-family:monospace;}
    .sm{display:flex;align-items:center;gap:7px;margin-bottom:11px;}
    .stot{font-size:14px;font-weight:700;color:${accent};}
    .swk{font-size:11px;color:#999;font-family:monospace;}
    .sw{display:flex;flex-wrap:wrap;gap:7px;}
    .wc{padding:8px 12px;border-radius:6px;background:${accent}10;border:1px solid ${accent}28;min-width:62px;text-align:center;}
    .wl{font-size:9px;font-weight:700;letter-spacing:1.2px;color:#999;margin-bottom:3px;font-family:monospace;}
    .wh{font-size:14px;font-weight:700;color:${accent};font-family:monospace;}
    .ft{margin-top:28px;padding-top:12px;border-top:1px solid #e5e5e5;font-size:10px;color:#bbb;display:flex;justify-content:space-between;font-family:monospace;}
  `;

  const rootInner = `
    <div class="root">
      <div class="hdr">
        <span class="tks">TKS</span>
        <span class="badge">${esc(def.label)}</span>
      </div>
      <div class="tr">
        <span class="em">${esc(project.emoji||"📌")}</span>
        <h1>${esc(project.title)}</h1>
      </div>
      <div class="dr">
        <span class="dlbl">DIFFICULTY</span>
        <div class="dots">${diffDots}</div>
        <span class="dtxt">${esc(diffLabel)}</span>
      </div>
      <div class="card">
        <div class="lbl">WHAT YOU'LL BUILD</div>
        <p class="dtxt2">${esc(project.summary||project.description)}</p>
      </div>
      <div class="two">
        ${(project.tools||[]).length>0 ? `<div class="card"><div class="lbl">TOOLS YOU'LL USE</div><div class="pills">${toolsHtml}</div></div>` : ""}
        ${topSkills.length>0 ? `<div class="card"><div class="lbl">SKILLS YOU'LL LEARN</div><div class="pills">${skillsHtml}</div></div>` : ""}
      </div>
      <div class="slbl">STEPS</div>
      ${stepsHtml}
      ${schedHtml}
      <div class="ft">
        <span>TKS Focus Builder</span>
        <span>${esc(project.title)}</span>
      </div>
    </div>`;

  const fullHtml =
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style>" +
    css +
    "</style></head><body style=\"margin:0;background:#fff;color:#1a1a1a;\">" +
    "<div id=\"pdf-wrap\" style=\"width:794px;padding:40px 48px;box-sizing:border-box;background:#fff;\">" +
    rootInner +
    "</div></body></html>";

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "PDF export");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:820px;height:10000px;border:0;margin:0;padding:0;opacity:1;pointer-events:none;";
  document.body.appendChild(iframe);

  const idoc = iframe.contentDocument || iframe.contentWindow.document;
  idoc.open();
  idoc.write(fullHtml);
  idoc.close();

  const wrap = idoc.getElementById("pdf-wrap");
  const target = wrap || idoc.body;
  iframe.style.height = Math.min(Math.max(target.scrollHeight + 120, 600), 20000) + "px";
  void target.offsetHeight;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 200));

  const filename = "TKS_" + project.title.replace(/[^a-zA-Z0-9\s]/g,"").replace(/\s+/g,"_").slice(0,50) + "_Guide.pdf";

  try {
    await window.html2pdf()
      .set({
        margin:      [10, 10, 10, 10],
        filename,
        image:       { type:"jpeg", quality:0.96 },
        html2canvas: {
          scale:2,
          useCORS:true,
          allowTaint:true,
          backgroundColor:"#ffffff",
          logging:false,
          windowWidth:820,
          scrollX:0,
          scrollY:0,
        },
        jsPDF:       { unit:"mm", format:"a4", orientation:"portrait" },
      })
      .from(target)
      .save();
  } finally {
    iframe.remove();
  }
}

// ══════════════════════════════════════════════════════
//  GUIDE SCREEN — thumbnail card navigation
// ══════════════════════════════════════════════════════
const TECH_GUIDE_DEFS = [
  {key:"article",label:"ARTICLE",   accent:"#60A5FA"},
  {key:"rep1",   label:"REP I",     accent:C.green},
  {key:"rep2",   label:"REP II",    accent:C.amber},
  {key:"create", label:"CREATE",    accent:C.rose},
];
const SCI_GUIDE_DEFS = [
  {key:"article",label:"ARTICLE",  accent:"#60A5FA"},
  {key:"apply",  label:"APPLY",    accent:C.green},
  {key:"review", label:"REVIEW",   accent:C.amber},
  {key:"idea",   label:"IDEA",     accent:C.rose},
];
function getGuideDefs(track){return track==="science"?SCI_GUIDE_DEFS:TECH_GUIDE_DEFS;}

function GuideScreen({content, selections}) {
  const [activeKey,  setActiveKey] =useState(null);
  const [entering,   setEntering]  =useState(false);
  const [exporting,  setExporting] =useState(false);

  const {hoursPerWeek}=content;
  const track=content.track||"technology";
  const GUIDE_DEFS=getGuideDefs(track);

  const getProject=(key)=>{
    const id=selections[key];
    if(!id)return null;
    if(key==="article")return content.articles?.find(a=>a.id===id)||null;
    if(key==="rep1")   return content.rep1?.find(p=>p.id===id)||null;
    if(key==="rep2")   return content.rep2?.find(p=>p.id===id)||null;
    if(key==="create") return content.create?.find(p=>p.title===id)||null;
    if(key==="apply")  return content.apply?.find(p=>p.id===id)||null;
    if(key==="review") return content.review?.find(p=>p.id===id)||null;
    if(key==="idea")   return content.idea?.find(p=>p.id===id)||null;
    return null;
  };

  function selectGuide(key){
    setEntering(true);
    setTimeout(()=>{setActiveKey(key);setEntering(false);},200);
  }
  function goBack(){
    setEntering(true);
    setTimeout(()=>{setActiveKey(null);setEntering(false);},200);
  }

  // ── Guide selector (4 cards) ─────────────────────────
  if(!activeKey){
    return (
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 0 80px",
        animation:entering?"fadeIn 0.0s":"fadeUp 0.3s ease-out",position:"relative",zIndex:1}}>
        <div style={{marginBottom:40}}>
          <SectionLabel text="GUIDE SELECTOR"/>
          <h2 style={{fontFamily:FM,fontSize:"clamp(22px,3vw,26px)",fontWeight:700,
            color:C.text,letterSpacing:"-0.4px",lineHeight:1.25,marginBottom:10}}>
            Choose a guide to explore
          </h2>
          <p style={{fontFamily:F,fontSize:14,color:C.textDim,lineHeight:1.65}}>
            Each section has a full step-by-step guide, tools, search queries, and a weekly schedule.
          </p>
        </div>

        {/* 2×2 card grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {GUIDE_DEFS.map((def,gi)=>{
            const project=getProject(def.key);
            if(!project)return null;
            const guide=getGuide(def.key,project,hoursPerWeek);
            return (
              <button key={def.key}
                className="guide-card"
                onClick={()=>selectGuide(def.key)}
                style={{
                  background:C.surface,
                  border:`1px solid ${C.border}`,
                  borderRadius:12,padding:"24px 22px",
                  cursor:"pointer",textAlign:"left",
                  backdropFilter:"blur(12px)",
                  boxShadow:"0 4px 24px rgba(0,0,0,0.3)",
                  animation:`fadeUp 0.3s ${gi*0.07}s ease-out both`,
                  position:"relative",overflow:"hidden",
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.borderColor=def.accent+"55";
                  e.currentTarget.style.background=`rgba(${rgbOf(def.accent)},0.07)`;
                  e.currentTarget.style.boxShadow=`0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${def.accent}22`;
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.borderColor=C.border;
                  e.currentTarget.style.background=C.surface;
                  e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.3)";
                }}>

                {/* Accent bar at top */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,
                  background:def.accent,opacity:0.6,borderRadius:"12px 12px 0 0"}}/>

                {/* Section label */}
                <div style={{fontFamily:FM,fontSize:"9px",color:def.accent,
                  letterSpacing:"2px",marginBottom:20}}>{def.label}</div>

                {/* Large icon */}
                <div style={{marginBottom:18,opacity:0.85}}>
                  <Glyph emoji={project.emoji} color={def.accent} size={36}/>
                </div>

                {/* Title */}
                <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:C.text,
                  lineHeight:1.35,marginBottom:8,
                  display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                  {project.title}
                </div>

                {/* Description */}
                <div style={{fontFamily:F,fontSize:12,color:C.textMuted,lineHeight:1.6,
                  marginBottom:16,
                  display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                  {project.summary||project.description}
                </div>

                {/* Footer */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {project.timeHours&&(
                      <span style={{fontFamily:FM,fontSize:9,color:C.textMuted,
                        background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,
                        padding:"2px 7px",borderRadius:3}}>~{project.timeHours}h</span>
                    )}
                    {project.difficulty!==undefined&&(
                      <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
                        <DiffBar level={project.difficulty}/>
                      </span>
                    )}
                  </div>
                  <span style={{fontFamily:FM,fontSize:10,color:def.accent,opacity:0.8}}>→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Guide detail ─────────────────────────────────────
  const project = getProject(activeKey);
  const guide   = getGuide(activeKey, project, hoursPerWeek);
  const def     = GUIDE_DEFS.find(d=>d.key===activeKey);
  const topSkills = (project?.skills||[]).slice(0,6);
  // Difficulty: article=1, rep1=1, rep2=3, create=3 (fallback if not on project)
  const diffLevel = project?.difficulty!==undefined ? project.difficulty
    : activeKey==="article" ? 1 : activeKey==="create" ? 3 : 1;
  const diffLabel = diffLevel<=1 ? "Beginner" : diffLevel===2 ? "Intermediate" : "Advanced";

  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"0 0 80px",
      animation:entering?"fadeIn 0s":"slideInRight 0.28s ease-out",position:"relative",zIndex:1}}>

      {/* Top action bar: Back + Export PDF */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32}}>
        <button onClick={goBack}
          style={{display:"inline-flex",alignItems:"center",gap:8,
            fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"1.5px",
            background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,
            padding:"7px 16px",cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.color=C.text;e.currentTarget.style.borderColor=C.borderHov;}}
          onMouseLeave={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.borderColor=C.border;}}>
          ← Back
        </button>
        <button
          disabled={exporting}
          onClick={async()=>{
            setExporting(true);
            try { await exportGuidePDF(project,guide,def,topSkills,diffLevel,diffLabel,hoursPerWeek); }
            catch(e){ console.error("PDF export failed:",e); alert("PDF export failed: "+e.message); }
            finally { setExporting(false); }
          }}
          style={{display:"inline-flex",alignItems:"center",gap:7,
            fontFamily:FM,fontSize:10,
            color:exporting?C.textMuted:def.accent,
            letterSpacing:"1.5px",
            background:exporting?C.surface:`rgba(${rgbOf(def.accent)},0.07)`,
            border:`1px solid ${exporting?C.border:def.accent+"44"}`,borderRadius:6,
            padding:"7px 16px",cursor:exporting?"default":"pointer",transition:"all 0.15s",
            opacity:exporting?0.6:1}}
          onMouseEnter={e=>{if(!exporting){
            e.currentTarget.style.background=`rgba(${rgbOf(def.accent)},0.14)`;
            e.currentTarget.style.borderColor=`${def.accent}88`;
          }}}
          onMouseLeave={e=>{if(!exporting){
            e.currentTarget.style.background=`rgba(${rgbOf(def.accent)},0.07)`;
            e.currentTarget.style.borderColor=`${def.accent}44`;
          }}}>
          {exporting ? "⏳ GENERATING…" : "↓ EXPORT PDF"}
        </button>
      </div>

      {/* Project header */}
      <div style={{marginBottom:28}}>
        <SectionLabel text={def.label} color={def.accent}/>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
          <Glyph emoji={project.emoji} color={def.accent} size={28}/>
          <h2 style={{fontFamily:FM,fontSize:"clamp(17px,2.5vw,21px)",fontWeight:700,
            color:C.text,letterSpacing:"-0.3px",lineHeight:1.3}}>
            {project.title}
          </h2>
        </div>
        {/* Difficulty bar */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"1px"}}>DIFFICULTY</span>
          <DiffBar level={diffLevel}/>
          <span style={{fontFamily:FM,fontSize:10,color:C.textMuted}}>{diffLabel}</span>
        </div>
      </div>

      {/* What you'll build */}
      <GlassCard style={{marginBottom:20}}>
        <SectionLabel text="WHAT YOU'LL BUILD"/>
        <p style={{fontFamily:F,fontSize:14,color:C.textDim,lineHeight:1.7,margin:0}}>
          {project.summary||project.description}
        </p>
      </GlassCard>

      {/* Tools + Skills — 2 col */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:32}}>
        {project.tools?.length>0&&(
          <GlassCard>
            <SectionLabel text="TOOLS YOU'LL USE"/>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {project.tools.map(t=>(
                <span key={t} style={{fontFamily:FM,fontSize:11,color:def.accent,
                  background:`rgba(${rgbOf(def.accent)},0.09)`,
                  border:`1px solid ${def.accent}33`,
                  padding:"4px 10px",borderRadius:5,lineHeight:1.5}}>
                  {t}
                </span>
              ))}
            </div>
          </GlassCard>
        )}
        {topSkills.length>0&&(
          <GlassCard>
            <SectionLabel text="SKILLS YOU'LL LEARN"/>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {topSkills.map(sk=>(
                <span key={sk} style={{fontFamily:FM,fontSize:11,color:C.textDim,
                  background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,
                  padding:"4px 10px",borderRadius:5,lineHeight:1.5}}>
                  {sk}
                </span>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Steps — with per-step searches */}
      <div style={{marginBottom:40}}>
        <SectionLabel text="STEPS"/>
        {guide?.steps?.map((step,i)=>(
          <div key={step.n} style={{display:"flex",gap:16,
            marginBottom:i<(guide?.steps?.length||0)-1?28:0,
            animation:`fadeUp 0.28s ${i*0.06}s ease-out both`}}>
            {/* Number + connector */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
              <div style={{width:28,height:28,borderRadius:6,
                background:`rgba(${rgbOf(def.accent)},0.12)`,
                border:`1px solid ${def.accent}33`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:FM,fontSize:"10px",color:def.accent,fontWeight:700}}>
                {String(step.n).padStart(2,"0")}
              </div>
              {i<(guide?.steps?.length||0)-1&&(
                <div style={{flex:1,width:1,marginTop:6,minHeight:20,
                  backgroundImage:`repeating-linear-gradient(to bottom,${C.border} 0,${C.border} 4px,transparent 4px,transparent 8px)`}}/>
              )}
            </div>
            {/* Content */}
            <div style={{flex:1,paddingTop:4,paddingBottom:i<(guide?.steps?.length||0)-1?16:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                <span style={{fontFamily:F,fontSize:14,fontWeight:700,color:C.text}}>{step.title}</span>
                <span style={{fontFamily:FM,fontSize:10,color:C.textMuted,
                  background:C.surface,border:`1px solid ${C.border}`,
                  padding:"2px 8px",borderRadius:4}}>{step.time}</span>
              </div>
              <p style={{fontFamily:F,fontSize:13,color:C.textDim,lineHeight:1.7,
                margin:"0 0 12px"}}>{step.desc}</p>
              {/* Per-step searches */}
              {(step.claude||step.youtube)&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {step.claude&&(
                    <div style={{padding:"9px 12px",borderRadius:6,
                      background:"rgba(96,165,250,0.06)",
                      border:"1px solid rgba(96,165,250,0.2)"}}>
                      <div style={{fontFamily:FM,fontSize:9,color:C.blue,
                        letterSpacing:"1.5px",marginBottom:6}}>ASK CLAUDE</div>
                      <div style={{fontFamily:FM,fontSize:11,color:C.textDim,
                        lineHeight:1.6}}>{step.claude}</div>
                    </div>
                  )}
                  {step.youtube&&(
                    <div style={{padding:"9px 12px",borderRadius:6,
                      background:"rgba(251,113,133,0.05)",
                      border:"1px solid rgba(251,113,133,0.18)"}}>
                      <div style={{fontFamily:FM,fontSize:9,color:C.rose,
                        letterSpacing:"1.5px",marginBottom:6}}>SEARCH YOUTUBE</div>
                      <div style={{fontFamily:FM,fontSize:11,color:C.textDim,
                        lineHeight:1.6}}>{step.youtube}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule */}
      {guide?.schedule&&(
        <GlassCard>
          <SectionLabel text="WEEKLY SCHEDULE"/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <span style={{fontFamily:FM,fontSize:13,color:def.accent,fontWeight:600}}>
              ~{guide.schedule.totalHours}h total
            </span>
            <span style={{fontFamily:FM,fontSize:10,color:C.textMuted}}>
              · {guide.schedule.weeks} week{guide.schedule.weeks>1?"s":""} at {content.hoursPerWeek}h/wk
            </span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {guide.schedule.schedule.map(w=>(
              <div key={w.week} style={{padding:"10px 14px",borderRadius:6,
                background:`rgba(${rgbOf(def.accent)},0.07)`,
                border:`1px solid ${def.accent}28`,
                minWidth:80,textAlign:"center"}}>
                <div style={{fontFamily:FM,fontSize:9,color:C.textMuted,letterSpacing:"1.2px",marginBottom:5}}>WK {w.week}</div>
                <div style={{fontFamily:FM,fontSize:15,color:def.accent,fontWeight:600}}>{w.hours}h</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════
//  APP ROOT
// ══════════════════════════════════════════════════════
export default function App() {
  useStyles();

  const [screen,   setScreen]   = useState("intro");
  const [sbOpen,   setSbOpen]   = useState(false);
  const [content,  setContent]  = useState(null);
  const [track,    setTrack]    = useState("technology");
  const [selections,setSel]     = useState({article:null,rep1:null,rep2:null,create:null});
  const [feedback, setFeedback] = useState("");
  const [momentum, setMomentum] = useState(28);
  const [surging,  setSurging]  = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [apiError, setApiError] = useState(null);
  const lastActivity             = useRef(Date.now());
  function emptySelections(t){
    return t==="science"
      ? {article:null,apply:null,review:null,idea:null}
      : {article:null,rep1:null,rep2:null,create:null};
  }

  // Momentum drain (idle > 8 min)
  useEffect(()=>{
    const id=setInterval(()=>{
      const idle=(Date.now()-lastActivity.current)/1000;
      if(idle>480) setMomentum(m=>Math.max(0,m-0.4));
    },4000);
    return ()=>clearInterval(id);
  },[]);

  const surge=useCallback((amount=14)=>{
    lastActivity.current=Date.now();
    setSurging(true);
    setMomentum(m=>Math.min(100,m+amount));
    setTimeout(()=>setSurging(false),700);
  },[]);

  const handleStart=()=>{surge(18);setScreen("input");};

  const handleInput=async(topic,hours,interests,selectedTrack="technology")=>{
    setGenTopic(topic);
    setTrack(selectedTrack);
    setApiError(null);
    setScreen("generating");
    surge(20);
    try {
      const c=await callClaudeAPI(topic,hours,interests,selectedTrack);
      setContent(c);
      setSel(emptySelections(selectedTrack));
      setFeedback("");
      setScreen("results");
    } catch(err) {
      console.error("Claude API error:",err);
      setApiError(err.message||String(err));
      await new Promise(r=>setTimeout(r,2800));
      const c={...generateContent(topic,hours,interests),track:selectedTrack};
      setContent(c);
      setSel(emptySelections(selectedTrack));
      setFeedback("");
      setApiError(null);
      setScreen("results");
    }
  };

  const handleSelect=(key,id)=>{
    const wasNull=selections[key]===null;
    setSel(s=>({...s,[key]:id}));
    if(wasNull)surge(10);
    else lastActivity.current=Date.now();
  };

  const handleSubmit=()=>{surge(22);setScreen("guide");};

  const handleRegenerate=async()=>{
    if(!content)return;
    const topic=content.focusTopic;
    const hours=content.hoursPerWeek;
    const interests=content.interests+(feedback?" "+feedback:"");
    const t=content.track||track;
    setGenTopic(topic);
    setApiError(null);
    setScreen("generating");
    surge(16);
    try {
      const c=await callClaudeAPI(topic,hours,interests,t);
      setContent(c);
      setSel(emptySelections(t));
      setFeedback("");
      setScreen("results");
    } catch(err) {
      console.error("Claude API error:",err);
      setApiError(err.message||String(err));
      await new Promise(r=>setTimeout(r,2800));
      const c={...generateContent(topic,hours,interests),track:t};
      setContent(c);
      setSel(emptySelections(t));
      setFeedback("");
      setApiError(null);
      setScreen("results");
    }
  };

  const handleReset=()=>{
    setScreen("intro");setContent(null);
    setTrack("technology");
    setSel({article:null,rep1:null,rep2:null,create:null});
    setFeedback("");setMomentum(28);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex"}}>
      <GrainOverlay/>
      <Sidebar open={sbOpen} onEnter={()=>setSbOpen(true)} onLeave={()=>setSbOpen(false)}
        screen={screen} onNav={setScreen} onReset={handleReset}/>
      <main style={{
        marginLeft:sbOpen?210:56,
        flex:1,minHeight:"100vh",
        padding:"52px 48px 96px",
        transition:"margin-left 0.15s cubic-bezier(0.4,0,0.2,1), background 0.35s ease",
        position:"relative",zIndex:1,
        ...(screen==="intro" ? {
          backgroundImage:`linear-gradient(135deg, rgba(13,14,16,0.42) 0%, rgba(13,14,16,0.55) 45%, rgba(13,14,16,0.48) 100%), url(${bgHomepage})`,
          backgroundSize:"cover",
          backgroundPosition:"center",
          backgroundRepeat:"no-repeat",
        } : {}),
      }}>
        <GhostTitle screen={screen}/>
        {screen==="intro"      && <IntroScreen onStart={handleStart}/>}
        {screen==="input"      && <InputScreen onSubmit={handleInput}/>}
        {screen==="generating" && <GeneratingScreen topic={genTopic} error={apiError}/>}
        {screen==="results" && content && (
          <ResultsScreen content={content} selections={selections}
            onSelect={handleSelect} onSubmit={handleSubmit}
            feedback={feedback} setFeedback={setFeedback} onRegenerate={handleRegenerate}/>
        )}
        {screen==="guide"   && content && (
          <GuideScreen content={content} selections={selections}/>
        )}
      </main>
      <MomentumBar momentum={momentum} surging={surging}/>
    </div>
  );
}
