import { GitFork, Pin, Target, Castle, Zap, Apple, Swords, Crown } from 'lucide-react';

export const puzzleThemes = [
  { key: "fork", title: "Fork", icon: GitFork, desc: "Attack two pieces at once with a single move." },
  { key: "pin", title: "Pin", icon: Pin, desc: "Immobilize a piece that's shielding something more valuable." },
  { key: "skewer", title: "Skewer", icon: Target, desc: "Attack a valuable piece, forcing it to move and exposing what's behind it." },
  { key: "backRankMate", title: "Back Rank Mate", icon: Castle, desc: "Checkmate a king trapped behind its own pawns." },
  { key: "discoveredAttack", title: "Discovered Attack", icon: Zap, desc: "Move one piece to unleash an attack from another." },
  { key: "hangingPiece", title: "Hanging Piece", icon: Apple, desc: "Spot the undefended piece free for the taking." },
  { key: "sacrifice", title: "Sacrifice", icon: Swords, desc: "Give up material now to win big later." },
  { key: "mateIn2", title: "Mate in 2", icon: Crown, desc: "Force checkmate in exactly two moves." },
];

export const minPuzzleRating = 600;
export const maxPuzzleRating = 2800;

export const streakTimerStartSeconds = 30;
export const streakTimerBonusSeconds = 1;
export const streakPuzzleCompleteBonusSeconds = 3;

// How long Blackout mode shows the puzzle before hiding the pieces.
// TODO: make this tunable per-player instead of a fixed constant.
export const blackoutRevealSeconds = 3;