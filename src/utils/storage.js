import {defaultRating} from './eloRating.js';

const usernameKey = 'userName';
const ratingKey = 'playerRatingId';
const dailyKey = 'dailyPuzzleId';
const blackoutRatingKey = 'blackoutRatingId';
const missingPieceRatingKey = 'missingPieceRatingId';

export function loadRating() {
  try {
    const stored = window.localStorage.getItem(ratingKey);
    const parsed = parseInt(stored, 10);
    return Number.isFinite(parsed) ? parsed : defaultRating;
  } catch {
    return defaultRating;
  }
}

export function saveRating(rating) {
  try {
    window.localStorage.setItem(ratingKey, String(rating));
  } catch {}
}

export function loadDaily() {
  try {
    return window.localStorage.getItem(dailyKey);
  } catch {
    return null;
  }
}

export function saveDaily(id) {
  try {
    window.localStorage.setItem(dailyKey, id);
  } catch {}
}

export function saveUsername(username) {
  try {
    window.localStorage.setItem(usernameKey, username);
  } catch {} 
}

export function loadUsername() {
  try {
    return window.localStorage.getItem(usernameKey);
  } catch {
    return null;
  }
}

export function loadBlackoutRating() {
  try {
    const stored = window.localStorage.getItem(blackoutRatingKey);
    const parsed = parseInt(stored, 10);
    return Number.isFinite(parsed) ? parsed : defaultRating;
  } catch {
    return defaultRating;
  }
}

export function saveBlackoutRating(rating) {
  try {
    window.localStorage.setItem(blackoutRatingKey, String(rating));
  } catch {}
}

export function loadMissingPieceRating() {
  try {
    const stored = window.localStorage.getItem(missingPieceRatingKey);
    const parsed = parseInt(stored, 10);
    return Number.isFinite(parsed) ? parsed : defaultRating;
  } catch {
    return defaultRating;
  }
}

export function saveMissingPieceRating(rating) {
  try {
    window.localStorage.setItem(missingPieceRatingKey, String(rating));
  } catch {}
}