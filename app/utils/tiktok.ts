// TS strict, no any
export type TikTokPost = { id: string; url: string };

const MAX_ITEMS = 9;

function safeJsonParse<T>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch { return null; }
}

function matchScriptById(html: string, id: string): string | null {
  const re = new RegExp(`<script[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i");
  const m = html.match(re);
  return m && m[1] ? m[1] : null;
}

export function hasCaptcha(html: string): boolean {
  return /\b(tiktok-verify-page|captcha|verify you are human)\b/i.test(html);
}
export function htmlSize(html: string): number { return html.length; }
export function hasSIGI(html: string): boolean { return matchScriptById(html, "SIGI_STATE") != null; }

type SigiState = {
  ItemModule?: Record<string, { id?: string; video?: { id?: string } }>;
};

function extractFromSIGI(html: string, handle: string): ReadonlyArray<TikTokPost> {
  const raw = matchScriptById(html, "SIGI_STATE");
  if (!raw) return [];
  const json = safeJsonParse<SigiState>(raw);
  if (!json?.ItemModule) return [];
  const out: TikTokPost[] = [];
  for (const key of Object.keys(json.ItemModule)) {
    const it = json.ItemModule[key];
    const vid = it?.id ?? it?.video?.id;
    if (!vid) continue;
    out.push({ id: vid, url: `https://www.tiktok.com/@${handle}/video/${vid}` });
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractByRegex(html: string, handle: string): ReadonlyArray<TikTokPost> {
  const set = new Set<string>();
  const h = escapeRegExp(handle);
  const re = new RegExp(`/@${h}/video/(\\d{8,22})`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const id = m[1];
    if (!set.has(id)) {
      set.add(id);
      if (set.size >= MAX_ITEMS) break;
    }
  }
  return Array.from(set).map((id) => ({ id, url: `https://www.tiktok.com/@${handle}/video/${id}` }));
}

export function extractPostsFromProfileHtml(html: string, handle: string): ReadonlyArray<TikTokPost> {
  const viaSigi = extractFromSIGI(html, handle);
  if (viaSigi.length > 0) return viaSigi;
  return extractByRegex(html, handle);
}

export function isValidHandle(h: string): boolean {
  return /^[a-zA-Z0-9._]{2,24}$/.test(h);
}