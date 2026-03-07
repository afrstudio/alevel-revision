const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://loekgdvqcybzmtgphcra.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvZWtnZHZxY3liem10Z3BoY3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjgxMTY4NywiZXhwIjoyMDg4Mzg3Njg3fQ.M5V24K4dYsU4lvqgiRZtynaxDb69w1m3V1zbKPRYli8";
const BUCKET = "papers";
const PAPERS_DIR = path.join(__dirname, "..", "public", "papers");
const CONCURRENCY = 20;

function getAllFiles(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) files.push(...getAllFiles(path.join(dir, e.name), rel));
    else files.push(rel);
  }
  return files;
}

async function uploadFile(relPath) {
  const filePath = path.join(PAPERS_DIR, relPath);
  const body = fs.readFileSync(filePath);
  const storagePath = relPath.replace(/\\/g, "/");

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "image/webp",
      "x-upsert": "true",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} uploading ${storagePath}: ${text}`);
  }
  return storagePath;
}

async function main() {
  const files = getAllFiles(PAPERS_DIR);
  console.log(`Found ${files.length} files to upload`);

  let uploaded = 0;
  let failed = 0;
  const errors = [];

  // Process in batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(uploadFile));

    for (const r of results) {
      if (r.status === "fulfilled") uploaded++;
      else {
        failed++;
        errors.push(r.reason.message);
        if (errors.length <= 5) console.error("  ERR:", r.reason.message);
      }
    }

    if ((uploaded + failed) % 200 === 0 || i + CONCURRENCY >= files.length) {
      console.log(`Progress: ${uploaded}/${files.length} uploaded, ${failed} failed`);
    }
  }

  console.log(`\nDone! ${uploaded} uploaded, ${failed} failed`);
  if (errors.length > 5) console.log(`(${errors.length - 5} more errors omitted)`);
}

main().catch(console.error);
