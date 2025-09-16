// optimize-images.mjs
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

// === CONFIG ===
const BANNER_INPUT = "./public/baniere/baniere2.webp";
const BANNER_OUT_DIR = "./public/baniere";
const BANNER_SIZES = [2560, 1920, 1536];

const PROJECTS_DIR = "./public/projects";
const PROJECT_SIZES = [1536, 800]; // grid cards

const AVIF_Q = 55; // 45–60
const WEBP_Q = 78; // 70–80
const BLUR_W = 24;
const BLUR_Q = 25;

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function buildDerivatives(inputPath, outDir, widths) {
  const base = path.basename(inputPath, path.extname(inputPath));
  const outputs = [];

  for (const width of widths) {
    const avifOut = path.join(outDir, `${base}-${width}.avif`);
    const webpOut = path.join(outDir, `${base}-${width}.webp`);

    await sharp(inputPath).resize({ width }).avif({ quality: AVIF_Q }).toFile(avifOut);
    await sharp(inputPath).resize({ width }).webp({ quality: WEBP_Q }).toFile(webpOut);

    outputs.push(avifOut, webpOut);
  }

  // blur
  const blurOut = path.join(outDir, `${base}-blur.webp`);
  await sharp(inputPath).resize({ width: BLUR_W }).webp({ quality: BLUR_Q }).toFile(blurOut);
  const buf = await fs.readFile(blurOut);
  const blurB64 = `data:image/webp;base64,${buf.toString("base64")}`;

  return { outputs, blurOut, blurB64, base };
}

async function exists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}

(async () => {
  // 1) Banner (si présent)
  if (await exists(BANNER_INPUT)) {
    await ensureDir(BANNER_OUT_DIR);
    console.log("→ Génération bannière…");
    const { outputs, blurOut, blurB64 } = await buildDerivatives(BANNER_INPUT, BANNER_OUT_DIR, BANNER_SIZES);
    for (const o of outputs) console.log(`  ✓ ${o}`);
    console.log(`  ✓ ${blurOut}`);
    console.log("\nCopie ce blur dans Hero.tsx → blurDataURL :\n");
    console.log(blurB64);
    console.log("");
  } else {
    console.log("(i) Bannière introuvable, étape ignorée:", BANNER_INPUT);
  }

  // 2) Projects
  console.log("→ Génération projets…");
  if (!(await exists(PROJECTS_DIR))) {
    console.log("(i) Dossier projets introuvable:", PROJECTS_DIR);
    process.exit(0);
  }

  const files = (await fs.readdir(PROJECTS_DIR)).filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()));
  if (files.length === 0) {
    console.log("(i) Aucune image trouvée dans", PROJECTS_DIR);
    process.exit(0);
  }

  const blurMap = {}; // { [basename]: dataURL }

  for (const file of files) {
    const inputPath = path.join(PROJECTS_DIR, file);
    const outDir = PROJECTS_DIR; // mêmes dossiers
    const { outputs, blurOut, blurB64, base } = await buildDerivatives(inputPath, outDir, PROJECT_SIZES);
    for (const o of outputs) console.log(`  ✓ ${o}`);
    console.log(`  ✓ ${blurOut}`);
    blurMap[base] = blurB64;
  }

  console.log("\n\n=== BlurDataURL à coller dans projects.ts ===\n");
  console.log(JSON.stringify(blurMap, null, 2));
  console.log("\nExemple d'usage dans projects.ts :\n");
  console.log(`// ...
// image: "/projects/p1-1536.avif",
// blurDataURL: blurMap["p1"],
// ...`);

  console.log("\nTerminé ✅");
})();