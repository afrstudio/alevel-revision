const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://loekgdvqcybzmtgphcra.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvZWtnZHZxY3liem10Z3BoY3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjgxMTY4NywiZXhwIjoyMDg4Mzg3Njg3fQ.M5V24K4dYsU4lvqgiRZtynaxDb69w1m3V1zbKPRYli8";
const BUCKET = "papers";
const PAPERS_DIR = path.join(__dirname, "..", "generated-papers");

async function uploadFile(filename) {
  const filePath = path.join(PAPERS_DIR, filename);
  const body = fs.readFileSync(filePath);
  const storagePath = `generated/${filename}`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} uploading ${storagePath}: ${text}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

async function main() {
  const files = fs.readdirSync(PAPERS_DIR).filter(f => f.endsWith(".pdf"));
  console.log(`Uploading ${files.length} PDFs to Supabase Storage...`);

  const manifest = [];
  for (const f of files) {
    try {
      const url = await uploadFile(f);
      console.log(`  Uploaded: ${f}`);

      // Parse filename for metadata
      const parts = f.replace(".pdf", "").split("-");
      const board = parts[0]; // Edexcel
      const subject = parts[1]; // Maths/Biology/Chemistry
      const paper = parts.slice(2, -1).join(" "); // Paper1-Pure / Paper2-StatsMech
      const set = parts[parts.length - 1]; // SetA / SetB

      manifest.push({ filename: f, board, subject, paper, set, url });
    } catch (e) {
      console.error(`  FAIL: ${f}: ${e.message}`);
    }
  }

  // Save manifest
  const manifestPath = path.join(__dirname, "..", "public", "data", "generated-papers.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest saved to ${manifestPath}`);
  console.log(`${manifest.length} papers uploaded successfully.`);
}

main().catch(console.error);
