import {Chess} from 'chess.js';
import {minPuzzleRating, maxPuzzleRating} from '../config/constants';

function ratingToBucket(rating) {
  const bucket = Math.round(rating / 100) * 100;
  return Math.min(maxPuzzleRating, Math.max(minPuzzleRating, bucket));
}

function buildPuzzle(record, titlePrefix) {
  const tempGame = new Chess(record.fen);
  const moveList = record.moves.split(' '); // "f3e4 d5e4 d1d8" turns into ['f3e4', 'd5e4', 'd1d8']
  const setupMove = moveList[0];
  const solution = moveList.slice(1);

  tempGame.move({
    from: setupMove.substring(0, 2),
    to: setupMove.substring(2, 4),
    promotion: setupMove.length > 4 ? setupMove.substring(4) : 'q' // if setup length is over 4, that means it ends with a promotion
  });

  return {
    id: record.id,
    title: titlePrefix,
    rating: record.rating,
    fen: tempGame.fen(),
    solution,
    lastMove: setupMove
  };
}

async function fetchLocalPuzzle(rating, theme) {
  const bucket = ratingToBucket(rating);
  const filename = theme ? `puzzles_${theme}_${bucket}.json` : `puzzles_${bucket}.json`;
  const response = await fetch(`/puzzles/${filename}`);
  
  if (!response.ok) throw new Error(`Could not load puzzle bucket: ${filename}`);
  const pool = await response.json();
  const record = pool[Math.floor(Math.random() * pool.length)];
  return [buildPuzzle(record, 'Puzzle')];
}

function getHash(str) {
  let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

async function fetchDailyPuzzle() {
  const dateString = new Date().toISOString().slice(0, 10);
  const bucketHash = getHash(`${dateString}-bucket`);
  const bucketCount = (maxPuzzleRating - minPuzzleRating) / 100 + 1;
  const bucket = minPuzzleRating + (bucketHash % bucketCount) * 100;
  const filename = `puzzles_${bucket}.json`;
  const response = await fetch(`/puzzles/${filename}`);
  if (!response.ok) throw new Error(`Could not load daily puzzles: ${filename}`);
  
  const pool = await response.json();
  const puzzleHash = getHash(`${dateString}-puzzle`);
  const index = puzzleHash % pool.length;
  
  return [buildPuzzle(pool[index], 'Daily Puzzle')];
}

export async function fetchPuzzles(mode, theme, rating) {
  if (mode === 'daily')
    return fetchDailyPuzzle();

  if (mode === 'streak' || mode === 'casual' || mode === 'blackout' || mode === 'missingPiece')
    return fetchLocalPuzzle(rating, null);

  if (mode === 'thematic') 
    return fetchLocalPuzzle(rating, theme);
}