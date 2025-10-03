// app/sections/TikTokGrid.tsx
"use client";
import React, { memo, useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";

/** Types & const */
export type TikTokItem={id:string;url:string;thumb?:string;title?:string;published_at?:string;mp4?:string;poster?:string};
type ApiOk={username:string;items:ReadonlyArray<TikTokItem>;count:number}; type ApiErr={error:string;message?:string;status?:number}; type ApiResp=ApiOk|ApiErr;
const ASPECT="9 / 16" as const, CARD_MAX_W=320;

/** Utils */
const isErr=(r:ApiResp):r is ApiErr=>"error"in r;
const isTikTok=(u:string)=>{try{return new URL(u).hostname.endsWith("tiktok.com")}catch{return false}};
const vidId=(u:string)=>{try{const p=new URL(u).pathname.split("/").filter(Boolean);const i=p.findIndex(x=>x==="video");return i>=0&&p[i+1]?p[i+1]:null}catch{return null}};
const canEmbed=(u:string)=>/^\d+$/.test(vidId(u)??"");
const eq=(a:TikTokItem,b:TikTokItem)=>a.id===b.id&&a.url===b.url&&a.poster===b.poster&&a.thumb===b.thumb&&a.title===b.title&&a.published_at===b.published_at;

/** TikTok embed script (idempotent) */
declare global{interface Window{tiktokEmbedLoaded?:()=>void;__ttEmbedReady?:boolean}}
let ttScriptP:Promise<void>|null=null;
function loadTT(){if(typeof document==="undefined"||window.__ttEmbedReady) return Promise.resolve(); if(ttScriptP) return ttScriptP;
  ttScriptP=new Promise<void>((ok,err)=>{const ex=document.querySelector<HTMLScriptElement>('script[data-tt-embed="1"]');
    const done=()=>{window.__ttEmbedReady=true;ok()}, fail=()=>err(new Error("tt_script_failed"));
    if(ex){if(window.__ttEmbedReady) return done(); ex.addEventListener("load",done,{once:true}); ex.addEventListener("error",fail,{once:true}); return;}
    const s=document.createElement("script"); s.src="https://www.tiktok.com/embed.js"; s.async=true; s.defer=true; s.setAttribute("data-tt-embed","1");
    s.onload=()=>{ done(); }; s.onerror=()=>{ fail(); }; document.body.appendChild(s);
  }); return ttScriptP;
}

/** oEmbed HTML cache + fetch */
const oCache=new Map<string,string>();
async function getOHtml(url:string,signal?:AbortSignal){const c=oCache.get(url); if(c) return c;
  const r=await fetch(`/api/tiktok/oembed?url=${encodeURIComponent(url)}`,{cache:"no-store",signal}); if(!r.ok) throw new Error(`oembed_http_${r.status}`);
  const j=await r.json() as {html?:string}; if(!j.html) throw new Error("oembed_missing_html"); oCache.set(url,j.html); return j.html;
}

/** Masquage CTA/footer (CSS-first + passe JS) */
const isFooter=(el:Element)=>{if(!(el instanceof HTMLElement))return false; const t=(el.textContent||"").toLowerCase();
  if(t.includes("regarder maintenant")||t.includes("watch now"))return true;
  const cls=`${el.className} ${el.getAttribute("data-e2e")||""}`; if(/\b(recommend|banner|login|cta|download|share|footer)\b/i.test(cls))return true;
  const prev=el.previousElementSibling; return !!(prev&&"matches"in prev&&prev.matches("blockquote.tiktok-embed"));
};
const hideFooter=(root:ParentNode|null)=>{if(!root) return; root.querySelectorAll<HTMLElement>("blockquote.tiktok-embed + *, blockquote.tiktok-embed ~ *").forEach(n=>{if(isFooter(n)){n.style.display="none";n.setAttribute("aria-hidden","true")}})};

/** oEmbed component */
const TikTokOEmbed=({url}:{url:string})=>{
  const ref=useRef<HTMLDivElement|null>(null);
  const [html,setHtml]=useState<string|null>(null);
  const [err,setErr]=useState<string|null>(null);
  useEffect(()=>{let m=true,obs:MutationObserver|null=null;
    (async()=>{
      try{
        if(html) return;
        const h=await getOHtml(url);
        if(!m) return;
        setHtml(h);
        await loadTT();
        if(!m) return;
        const hydrate=()=>{
          try{
            window.tiktokEmbedLoaded?.();
            const roots=[ref.current,ref.current?.parentElement??null].filter((x): x is HTMLElement => !!x);
            const run=()=>roots.forEach(r=>hideFooter(r));
            run();
            obs=new MutationObserver(run);
            roots.forEach(r=>obs!.observe(r,{childList:true,subtree:true}));
          }catch{/* no-op */}
        };
        // run ASAP when main thread is idle enough
        if("requestIdleCallback" in window){
          (window as unknown as {requestIdleCallback: (cb:()=>void)=>void}).requestIdleCallback(hydrate);
        } else {
          queueMicrotask(hydrate);
        }
      }catch(e){ if(m) setErr(e instanceof Error ? e.message : "oembed_unknown_error"); }
    })();
    return()=>{m=false; obs?.disconnect();};
  },[url,html]);
  if(!html) return <div ref={ref} className="animate-pulse bg-foreground/10" style={{aspectRatio:ASPECT}}/>;
  return <div ref={ref} className="tt-crop" style={{aspectRatio:ASPECT}}>
    <div dangerouslySetInnerHTML={{__html:html}}/>{err?<span className="sr-only">Erreur oEmbed: {err}</span>:null}
  </div>;
};

/** Card shell compacte */
const Card=({children,ariaLabel,containerRef}:{children:React.ReactNode;ariaLabel:string;containerRef:React.RefObject<HTMLDivElement|null>})=>
  <article ref={containerRef} className="w-full max-w-[320px] overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md" style={{maxWidth:CARD_MAX_W}} aria-label={ariaLabel}>
    <div className="w-full" style={{aspectRatio:ASPECT}}>{children}</div>
  </article>;

/** Card */
const TikTokCardBase=({item}:{item:TikTokItem})=>{
  const vid=useMemo(()=>canEmbed(item.url)?vidId(item.url):null,[item.url]);
  const containerRef=useRef<HTMLDivElement|null>(null);
  if(vid) return <Card ariaLabel={item.title||"Vidéo TikTok"} containerRef={containerRef}><TikTokOEmbed url={item.url}/></Card>;
  return (
    <a href={item.url} target="_blank" rel="nofollow noopener noreferrer" aria-label="Voir la vidéo sur TikTok" className="block w-full overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md" style={{maxWidth:CARD_MAX_W}}>
      <div style={{aspectRatio:ASPECT}} className="relative grid w-full place-items-center bg-foreground/5">
        {item.thumb? (
          <Image
            src={item.thumb}
            alt={item.title||"Aperçu TikTok"}
            fill
            sizes="(max-width: 640px) 320px, 320px"
            className="object-cover"
            priority={false}
          />
        ) : (
          <span className="px-3 text-center text-xs text-foreground/60">Vidéo indisponible — ouvrir sur TikTok</span>
        )}
      </div>
    </a>
  );
};
const TikTokCard=memo(TikTokCardBase,(a,b)=>eq(a.item,b.item));

/** Data fetch */
const sig=(arr:ReadonlyArray<TikTokItem>)=>arr.map(x=>x.id).join("|");
const uniqById = (arr: ReadonlyArray<TikTokItem>): ReadonlyArray<TikTokItem> => {
  const seen = new Set<string>();
  const out: TikTokItem[] = [];
  for (const it of arr) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
};
async function fetchOnce(limit:number,etag:string,signal:AbortSignal){const r=await fetch(`/api/tiktok/cache?limit=${limit}`,{cache:"no-store",signal,headers:etag?{"If-None-Match":etag}:{}}); 
  if(r.status===304) return {items:[],etag:etag||null};
  if(!r.ok) throw new Error(`http_${r.status}`);
  const j=await r.json() as ApiResp; if(isErr(j)) throw new Error(j.error||"unknown_error");
  return {items:j.items.filter(i=>isTikTok(i.url)), etag:r.headers.get("ETag")};
}

/** Grid + scroll lock */
export default function TikTokGrid({initialItems=[] as ReadonlyArray<TikTokItem>}:{initialItems?:ReadonlyArray<TikTokItem>}){
  const [items,setItems]=useState(initialItems),[err,setErr]=useState<string|null>(null),[loading,setLoading]=useState(initialItems.length===0);
  const last=useRef(""), abortRef=useRef<AbortController|null>(null), needInit=initialItems.length===0;

  const errMsg = (e: unknown) => (e instanceof Error ? e.message : "unknown_error");

  useEffect(()=>{let m=true,t:ReturnType<typeof setInterval>|null=null;
    const load=async()=>{try{setLoading(true); abortRef.current?.abort(); const ctl=new AbortController(); abortRef.current=ctl;
      const prev=typeof window!=="undefined"?sessionStorage.getItem("tt-cache-etag")??"":""; const {items:fresh,etag}=await fetchOnce(9,prev,ctl.signal);
      const freshUniq = uniqById(fresh);
      if(freshUniq.length===0 && items.length>0){ setErr(null); return; }
      if(freshUniq.length===0 && items.length===0){
        if(typeof window!=="undefined") sessionStorage.removeItem("tt-cache-etag");
        const s2=await fetchOnce(9,"",ctl.signal);
        if(!m) return;
        const s2Uniq = uniqById(s2.items);
        const g = s2Uniq.length>0 ? sig(s2Uniq) : "";
        if(g!==last.current){ setItems(s2Uniq); last.current=g; }
        setErr(null);
        if(typeof window!=="undefined"&&s2.etag) sessionStorage.setItem("tt-cache-etag", s2.etag!);
        return;
      }
      if(!m) return;
      const g2 = freshUniq.length>0 ? sig(freshUniq) : "";
      if(g2!==last.current){ setItems(freshUniq); last.current=g2; }
      setErr(null);
      if(typeof window!=="undefined"&&etag) sessionStorage.setItem("tt-cache-etag", etag);
    } catch (e) { if (m) setErr(errMsg(e)); } finally { m && setLoading(false); }};
    if(needInit) void load(); t=setInterval(load,2*60*60*1000);
    return()=>{m=false; if(t)clearInterval(t); abortRef.current?.abort(); abortRef.current=null};
  },[needInit,items.length]);

  const some=items.length>0;
  return <section className="w-full">
    {loading&&items.length===0&&(<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-[480px] w-full max-w-[320px] animate-pulse rounded-xl bg-foreground/5"/>)}</div>)}
    {!loading&&err&&(<p className="text-sm text-red-500">TikTok indisponible : <span className="font-medium">{err}</span></p>)}
    {!err&&some&&(<div className="grid grid-cols-1 justify-items-center gap-6 overflow-visible sm:grid-cols-2 lg:grid-cols-3">
      {items.map(it => (
        <div key={it.id} className="relative w-full max-w-[320px] rounded-xl overflow-hidden">
          <TikTokCard item={it}/>
          <div className="absolute inset-0 rounded-xl border-2 border-foreground/30 pointer-events-none z-10" />
        </div>
      ))}
    </div>)}
    {!loading&&!err&&!some&&(<p className="text-sm text-foreground/70">Aucune vidéo publique détectée.</p>)}
    <style jsx global>{`
      /* CSS-first: hide common footer/CTA siblings injected by TikTok */
      blockquote.tiktok-embed{margin:0!important;background:transparent!important}
      blockquote.tiktok-embed+section,blockquote.tiktok-embed~section,blockquote.tiktok-embed+div,blockquote.tiktok-embed~div{display:none!important}
      /* Crop-safe wrapper for embeds (évite de rogner la vidéo) */
      .tt-crop{position:relative;overflow:clip;background:#fff}
      .tt-crop>*{width:100%!important;height:100%!important;max-height:none!important;display:block}
      .tt-crop blockquote.tiktok-embed{margin:0!important;background:#fff!important;height:100%!important}
      .tt-crop iframe{width:100%!important;height:100%!important;display:block}
      /* Hide caption/description placeholders while we wait for the real player */
      .tt-crop :is(figcaption,.tiktok-embed-caption,[data-e2e*="caption"],[data-e2e*="describe"],[data-e2e*="music-info"]) {display:none!important}
    `}</style>
  </section>;
}