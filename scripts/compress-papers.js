/**
 * Compress exam paper images (QP only) to WebP format for the Past Papers viewer.
 * Copies from A-LEVEL source folder to public/papers/ with compression.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE = 'C:\\Users\\atifm\\Desktop\\gcse-downloader\\A-LEVEL';
const DEST = path.join(__dirname, '..', 'public', 'papers');
const SUBJECTS = ['Maths', 'Biology', 'Chemistry'];

// Build a manifest of all papers for the frontend
const manifest = {};

async function processFile(srcPath, destPath) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await sharp(srcPath)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 55 })
    .toFile(destPath);
}

async function main() {
  let totalFiles = 0;
  let totalSize = 0;

  for (const subject of SUBJECTS) {
    const subjectDir = path.join(SOURCE, subject);
    if (!fs.existsSync(subjectDir)) continue;

    manifest[subject] = {};

    const boards = fs.readdirSync(subjectDir).filter(f =>
      fs.statSync(path.join(subjectDir, f)).isDirectory()
    );

    for (const board of boards) {
      manifest[subject][board] = {};
      const boardDir = path.join(subjectDir, board);
      const papers = fs.readdirSync(boardDir).filter(f =>
        fs.statSync(path.join(boardDir, f)).isDirectory()
      );

      for (const paper of papers) {
        manifest[subject][board][paper] = {};
        const paperDir = path.join(boardDir, paper);
        const sessions = fs.readdirSync(paperDir).filter(f => {
          const fullPath = path.join(paperDir, f);
          return fs.statSync(fullPath).isDirectory() && f.includes('QP');
        });

        for (const session of sessions) {
          const sessionDir = path.join(paperDir, session);
          const pages = fs.readdirSync(sessionDir)
            .filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
            .sort();

          if (pages.length === 0) continue;

          // Clean session name for URL: "June 2019 QP" -> "june-2019-qp"
          const cleanSession = session.toLowerCase().replace(/\s+/g, '-');
          const cleanSubject = subject.toLowerCase();
          const cleanBoard = board.toLowerCase();
          const cleanPaper = paper.toLowerCase().replace(/\s+/g, '-');

          const destDir = path.join(DEST, cleanSubject, cleanBoard, cleanPaper, cleanSession);

          const pagePaths = [];
          for (const page of pages) {
            const srcPath = path.join(sessionDir, page);
            const destFile = page.replace(/\.(png|jpg)$/, '.webp');
            const destPath = path.join(destDir, destFile);

            try {
              await processFile(srcPath, destPath);
              const stat = fs.statSync(destPath);
              totalSize += stat.size;
              totalFiles++;
              pagePaths.push(`/papers/${cleanSubject}/${cleanBoard}/${cleanPaper}/${cleanSession}/${destFile}`);
            } catch (err) {
              console.error(`  Error: ${srcPath}: ${err.message}`);
            }
          }

          manifest[subject][board][paper][session] = {
            pages: pagePaths,
            pageCount: pagePaths.length,
          };

          if (totalFiles % 100 === 0 && totalFiles > 0) {
            console.log(`  Processed ${totalFiles} files (${(totalSize / 1024 / 1024).toFixed(1)} MB)...`);
          }
        }
      }
    }
  }

  // Write manifest
  const manifestPath = path.join(__dirname, '..', 'src', 'data', 'papers-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\nDone!`);
  console.log(`  Total files: ${totalFiles}`);
  console.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Manifest: ${manifestPath}`);
}

main().catch(console.error);
