import { createElement } from 'react';
import { defaultPieces } from 'react-chessboard';

export function pieceImageUrl(type, color) {
  const colorPrefix = color === 'w' ? 'w' : 'b';
  const pieceLetter = type.toUpperCase();
  return `https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece/cburnett/${colorPrefix}${pieceLetter}.svg`;
}

export function getCheckSquare(gameInstance) {
  if (!gameInstance.inCheck()) return null;
  const turnColor = gameInstance.turn();
  const board = gameInstance.board();
  for (const row of board) {
    for (const square of row) {
      if (square && square.type === 'k' && square.color === turnColor) {
        return square.square;
      }
    }
  }
  return null;
}

// ids for every piece (color and piece) to be used for invisible piece rendering
export const pieceCodes = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
export const invisiblePieces = Object.fromEntries(
  pieceCodes.map((code) => [code, () => createElement('div', { style: { position: 'absolute', inset: 0 } })])
);

export function buildPiecesHidingSquare(square) {
  return Object.fromEntries(
    pieceCodes.map((code) => [code, (props) => (
      props?.square === square
        ? createElement('div', { style: { position: 'absolute', inset: 0 } })
        : createElement(defaultPieces[code], props)
    )])
  );
}