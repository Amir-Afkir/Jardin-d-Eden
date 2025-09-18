// optimize-images.mjs
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

// === CONFIG (défauts) ===
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

function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMG_EXT.has(ext);
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

  // blur tiny
  const blurOut = path.join(outDir, `${base}-blur.webp`);
  await sharp(inputPath).resize({ width: BLUR_W }).webp({ quality: BLUR_Q }).toFile(blurOut);
  const buf = await fs.readFile(blurOut);
  const blurB64 = `data:image/webp;base64,${buf.toString("base64")}`;

  return { outputs, blurOut, blurB64, base };
}

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function processSingleFile(filePath, sizes) {
  if (!isImageFile(filePath)) {
    console.log(`(i) Ignoré (pas une image supportée): ${filePath}`);
    return null;
  }
  const outDir = path.dirname(filePath);
  const { outputs, blurOut, blurB64, base } = await buildDerivatives(filePath, outDir, sizes);
  for (const o of outputs) console.log(`  ✓ ${o}`);
  console.log(`  ✓ ${blurOut}`);
  return { base, blurB64 };
}

async function processDirectory(dirPath, sizes) {
  const entries = await fs.readdir(dirPath);
  const files = entries
    .filter((f) => isImageFile(f))
    .map((f) => path.join(dirPath, f));

  if (files.length === 0) {
    console.log("(i) Aucune image trouvée dans", dirPath);
    return {};
  }

  const blurMap = {};
  for (const file of files) {
    const res = await processSingleFile(file, sizes);
    if (res) blurMap[res.base] = res.blurB64;
  }
  return blurMap;
}

(async () => {
  const arg = process.argv[2]; // chemin optionnel (fichier OU dossier)
  if (arg) {
    // Mode ciblé
    const target = path.resolve(arg);
    let stat;
    try {
      stat = await fs.stat(target);
    } catch {
      console.error(`❌ Chemin introuvable: ${target}`);
      process.exit(1);
    }

    if (stat.isDirectory()) {
      console.log("→ Génération pour le dossier:", target);
      const blurMap = await processDirectory(target, PROJECT_SIZES);
      console.log("\n=== BlurDataURL à coller dans projects.ts ===");
      console.log(JSON.stringify(blurMap, null, 2));
      console.log("\nTerminé ✅");
      return;
    }

    // fichier
    console.log("→ Génération pour le fichier:", target);
    const res = await processSingleFile(target, PROJECT_SIZES);
    if (res) {
      console.log("\n=== BlurDataURL pour ce fichier ===");
      console.log(JSON.stringify({ [res.base]: res.blurB64 }, null, 2));
    }
    console.log("\nTerminé ✅");
    return;
  }

  // Mode par défaut (aucun argument) : bannière + tout le dossier projects
  console.log("→ Mode par défaut (bannière + projects)");

  // 1) Bannière (si présente)
  if (await exists(BANNER_INPUT)) {
    await ensureDir(BANNER_OUT_DIR);
    console.log("→ Génération bannière…");
    const { outputs, blurOut, blurB64 } = await buildDerivatives(
      BANNER_INPUT,
      BANNER_OUT_DIR,
      BANNER_SIZES
    );
    for (const o of outputs) console.log(`  ✓ ${o}`);
    console.log(`  ✓ ${blurOut}`);
    console.log("\nCopie ce blur dans Hero.tsx → blurDataURL :\n");
    console.log(blurB64);
    console.log("");
  } else {
    console.log("(i) Bannière introuvable, étape ignorée:", BANNER_INPUT);
  }

  // 2) Projects (dossier complet)
  console.log("→ Génération projets…");
  if (!(await exists(PROJECTS_DIR))) {
    console.log("(i) Dossier projets introuvable:", PROJECTS_DIR);
    process.exit(0);
  }
  const blurMap = await processDirectory(PROJECTS_DIR, PROJECT_SIZES);

  console.log("\n=== BlurDataURL à coller dans projects.ts ===");
  console.log(JSON.stringify(blurMap, null, 2));
  console.log("\nExemple d'usage dans projects.ts :\n");
  console.log(`// ...
// image: "/projects/p1-1536.avif",
// blurDataURL: blurMap["p1"],
// ...`);

  console.log("\nTerminé ✅");
})(); 