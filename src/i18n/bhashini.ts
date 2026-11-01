/**
 * Dynamic-data translation hook structure (Bhashini / LLM).
 *
 * The UI chrome is translated statically in ./translations.ts. Free-text *data* (promise
 * wording, project titles, case descriptions) can be translated on demand through this
 * adapter. It is a no-op until you set the env vars below, so the site works offline.
 *
 *   BHASHINI_USER_ID, BHASHINI_API_KEY, BHASHINI_PIPELINE_ID  -> Bhashini ULCA pipeline
 *   LLM_TRANSLATE_URL                                          -> any POST {text,to} -> {text}
 *
 * Call this from a Route Handler (server side) so keys are never shipped to the client.
 */

export interface TranslateRequest {
  text: string;
  from?: string;
  to: string;
}

export interface TranslateProvider {
  name: string;
  translate(req: TranslateRequest): Promise<string>;
}

const cache = new Map<string, string>();

export const bhashiniProvider: TranslateProvider = {
  name: "bhashini",
  async translate({ text, from = "en", to }) {
    const { BHASHINI_USER_ID, BHASHINI_API_KEY, BHASHINI_PIPELINE_ID } = process.env;
    if (!BHASHINI_USER_ID || !BHASHINI_API_KEY || !BHASHINI_PIPELINE_ID) return text;
    const res = await fetch("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: BHASHINI_API_KEY, userID: BHASHINI_USER_ID },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: "translation", config: { language: { sourceLanguage: from, targetLanguage: to }, serviceId: BHASHINI_PIPELINE_ID } }],
        inputData: { input: [{ source: text }] },
      }),
    });
    if (!res.ok) return text;
    const json = await res.json();
    return json?.pipelineResponse?.[0]?.output?.[0]?.target ?? text;
  },
};

export const llmProvider: TranslateProvider = {
  name: "llm",
  async translate({ text, to }) {
    const url = process.env.LLM_TRANSLATE_URL;
    if (!url) return text;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, to }) });
    if (!res.ok) return text;
    const json = (await res.json()) as { text?: string };
    return json.text ?? text;
  },
};

/** Tries Bhashini first, then the LLM fallback; always returns the source text on failure. */
export async function translateDynamic(req: TranslateRequest): Promise<string> {
  if (req.to === (req.from ?? "en")) return req.text;
  const k = `${req.to}:${req.text}`;
  const hit = cache.get(k);
  if (hit) return hit;
  for (const p of [bhashiniProvider, llmProvider]) {
    try {
      const out = await p.translate(req);
      if (out && out !== req.text) {
        cache.set(k, out);
        return out;
      }
    } catch {
      /* try next provider */
    }
  }
  return req.text;
}
