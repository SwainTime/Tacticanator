// build-puzzles.js
//
// Converts the Lichess puzzle database CSV (lichess_db_puzzle.csv) into
// per-rating-bucket (and per-theme) JSON files under public/puzzles/,
// matching the shape expected by fetchLocalPuzzle() in the app:
//
//   [{ id, fen, moves, rating }, ...]
//
// Usage:
//   node build-puzzles.js
//
// Assumes this script sits at the project root, next to
// lichess_db_puzzle.csv, and that there's a public/ folder at the
// project root (Vite serves files from there at the site root, e.g.
// public/puzzles/puzzles_1200.json -> fetch('/puzzles/puzzles_1200.json')).

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const CSV_PATH = path.join(process.cwd(), 'lichess_db_puzzle.csv');
const OUT_DIR = path.join(process.cwd(), 'public', 'puzzles');

const MIN_BUCKET = 600;
const MAX_BUCKET = 2800;
const BUCKET_SIZE = 100;

// Cap how many puzzles we keep per bucket/theme so the JSON files
// (and this script's memory use) stay reasonable. Increase if you want
// more variety.
const MAX_PER_FILE = 500;

// Theme keys used by the app's THEMATIC_THEMES, mapped to the theme
// tags Lichess uses in its "Themes" column (space-separated, e.g.
// "fork middlegame short"). Add more mappings here if you add more
// thematic categories in the app.
const THEME_MAP = {
  fork: 'fork',
  pin: 'pin',
  skewer: 'skewer',
  backRankMate: 'backRankMate',
  discoveredAttack: 'discoveredAttack',
  hangingPiece: 'hangingPiece',
  sacrifice: 'sacrifice',
  mateIn2: 'mateIn2',
};

function ratingToBucket(rating) {
  const bucket = Math.round(rating / BUCKET_SIZE) * BUCKET_SIZE;
  return Math.min(MAX_BUCKET, Math.max(MIN_BUCKET, bucket));
}

// Minimal CSV line parser that handles quoted fields (Lichess's CSV
// doesn't usually need this, but it's safer than a naive split(',')).
function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { fields.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Could not find CSV at ${CSV_PATH}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const ratingBuckets = new Map();   // bucket -> array of records
  const themeBuckets = new Map();    // "theme_bucket" -> array of records

  const rl = readline.createInterface({
    input: fs.createReadStream(CSV_PATH),
    crlfDelay: Infinity,
  });

  let header = null;
  let colIdx = {};
  let lineNum = 0;
  let kept = 0;

  for await (const line of rl) {
    lineNum++;
    if (!line.trim()) continue;

    if (!header) {
      header = parseCsvLine(line);
      header.forEach((name, i) => { colIdx[name.trim()] = i; });
      const required = ['PuzzleId', 'FEN', 'Moves', 'Rating', 'Themes'];
      for (const col of required) {
        if (!(col in colIdx)) {
          console.error(`CSV is missing expected column "${col}". Found columns: ${header.join(', ')}`);
          process.exit(1);
        }
      }
      continue;
    }

    const fields = parseCsvLine(line);
    const id = fields[colIdx.PuzzleId];
    const fen = fields[colIdx.FEN];
    const moves = fields[colIdx.Moves];
    const rating = parseInt(fields[colIdx.Rating], 10);
    const themes = (fields[colIdx.Themes] || '').split(' ').filter(Boolean);

    if (!id || !fen || !moves || Number.isNaN(rating)) continue;

    const record = { id, fen, moves, rating };
    const bucket = ratingToBucket(rating);

    // Rating-only bucket (used by streak mode)
    if (!ratingBuckets.has(bucket)) ratingBuckets.set(bucket, []);
    const generalArr = ratingBuckets.get(bucket);
    if (generalArr.length < MAX_PER_FILE) {
      generalArr.push(record);
    } else if (Math.random() < 0.1) {
      // reservoir-ish sampling once full, so late rows still get a chance
      generalArr[Math.floor(Math.random() * generalArr.length)] = record;
    }

    // Theme buckets (used by thematic mode)
    for (const appTheme of Object.keys(THEME_MAP)) {
      const csvTag = THEME_MAP[appTheme];
      if (themes.includes(csvTag)) {
        const key = `${appTheme}_${bucket}`;
        if (!themeBuckets.has(key)) themeBuckets.set(key, []);
        const arr = themeBuckets.get(key);
        if (arr.length < MAX_PER_FILE) {
          arr.push(record);
        } else if (Math.random() < 0.1) {
          arr[Math.floor(Math.random() * arr.length)] = record;
        }
      }
    }

    kept++;
    if (lineNum % 200000 === 0) {
      console.log(`Processed ${lineNum} rows...`);
    }
  }

  let filesWritten = 0;

  for (const [bucket, records] of ratingBuckets) {
    if (!records.length) continue;
    const outPath = path.join(OUT_DIR, `puzzles_${bucket}.json`);
    fs.writeFileSync(outPath, JSON.stringify(records));
    filesWritten++;
  }

  for (const [key, records] of themeBuckets) {
    if (!records.length) continue;
    const outPath = path.join(OUT_DIR, `puzzles_${key}.json`);
    fs.writeFileSync(outPath, JSON.stringify(records));
    filesWritten++;
  }

  console.log(`Done. Read ${lineNum} lines, kept ${kept} puzzles, wrote ${filesWritten} JSON files to ${OUT_DIR}`);

  // Sanity check: warn about any rating bucket in the app's supported
  // range that ended up with no file (streak mode would 404 on these).
  const missing = [];
  for (let b = MIN_BUCKET; b <= MAX_BUCKET; b += BUCKET_SIZE) {
    if (!ratingBuckets.has(b) || !ratingBuckets.get(b).length) missing.push(b);
  }
  if (missing.length) {
    console.warn(`Warning: no puzzles found for rating buckets: ${missing.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});