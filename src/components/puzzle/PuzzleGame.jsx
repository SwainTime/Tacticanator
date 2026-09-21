import {Chessboard} from 'react-chessboard';
import {Timer, Flame, Zap} from 'lucide-react';

import Layout from '../ui/Layout';
import StatBadge from '../ui/StatBadge';
import PromotionalModal from '../ui/PromotionalModal';
import GameOverModal from '../ui/GameOverModal';
import {colors, fonts, backButtonStyle} from '../../config/theme';
import {streakTimerStartSeconds} from '../../config/constants';
import {invisiblePieces, buildPiecesHidingSquare, pieceCodes, pieceImageUrl} from '../../utils/chessHelpers';

import { usePuzzleEngine } from '../../hooks/usePuzzleEngine';

export default function PuzzleGame({
  mode, theme, sharedPuzzle, onSwitchMode, onBack,
  generalRating, onGeneralRatingChange,
  blackoutRating, onBlackoutRatingChange,
  missingPieceRating, onMissingPieceRatingChange,
}) {
  const { state, actions } = usePuzzleEngine({
    mode, theme, onSwitchMode, sharedPuzzle,
    generalRating, onGeneralRatingChange,
    blackoutRating, onBlackoutRatingChange,
    missingPieceRating, onMissingPieceRatingChange,
  });
  const {
    isLoading,
    error,
    displayedFen,
    checkSquare,
    playerColor,
    movePairs,
    score,
    streak,
    timeRemaining,
    isBlackedOut,
    pieceGuessed,
    missingPieceSquare,
    activeRating,
    currentPuzzleRating,
    statusLabel,
    statusColor,
    isSolved,
    viewIndex,
    positionHistoryLength,
    pendingPromotion,
    showGameOver,
    lastRunScore,
    setupMoveSquares,
    hintSquare,
  } = state;
  const {
    onPieceDrop,
    handlePromotionChoice,
    getHint,
    guessPiece,
    resetPuzzle,
    nextPuzzle,
    startNewStreak,
    setViewIndex,
  } = actions;

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2 style={{ fontFamily: fonts.display, color: colors.textInverted, fontWeight: 600 }}>
            Loading puzzle…
          </h2>
          <div style={{ fontSize: '40px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2 style={{ fontFamily: fonts.display, color: colors.danger, fontWeight: 600 }}>{error}</h2>
          <button
            onClick={onBack}
            style={backButtonStyle}
          >
            Return to Menu
          </button>
        </div>
      </Layout>
    );
  }

  // Once the puzzle is solved, reveal the real pieces again so the player
  // can actually see what they just did instead of staring at a blank board.
  const hidePieces = mode === 'blackout' && isBlackedOut && !isSolved;
  const showMissingPieceTray = mode === 'missingPiece' && !pieceGuessed;

  return (
    <Layout>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {pendingPromotion && (
          <PromotionalModal color={pendingPromotion.color} onSelect={handlePromotionChoice} />
        )}

        {showGameOver && (
          <GameOverModal score={lastRunScore} onStartNewStreak={startNewStreak} />
        )}

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {showMissingPieceTray && (
            <div style={{
              flex: '0 0 156px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              backgroundColor: colors.surface,
              borderRadius: '8px',
              border: `1px solid ${colors.primary}`,
              padding: '14px',
              alignContent: 'start',
            }}>
              {pieceCodes.map((code) => {
                const pieceColor = code[0];
                const pieceType = code[1].toLowerCase();
                return (
                  <button
                    key={code}
                    onClick={() => guessPiece(code)}
                    title={code}
                    style={{
                      width: '62px',
                      height: '62px',
                      padding: 0,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      border: `1px solid ${colors.primaryLight}`,
                      backgroundColor: pieceColor === 'w' ? colors.textInverted : colors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img src={pieceImageUrl(pieceType, pieceColor)} alt={code} width="46" height="46" />
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ flex: '3 1 460px', minWidth: '320px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {mode === 'shared' ? (
                <StatBadge label="Puzzle Type" value="Shared" />
              ) : (
                <StatBadge label="Puzzle Rating" value={currentPuzzleRating} />
              )}
              <StatBadge
                label={
                  mode === 'streak' ? 'Streak Rating'
                    : mode === 'blackout' ? 'Blackout Rating'
                    : mode === 'missingPiece' ? 'Missing Piece Rating'
                    : 'Your Rating'
                }
                value={activeRating}
                accentColor={colors.success}
              />
            </div>

            <Chessboard
              options={{
                position: displayedFen,
                onPieceDrop: onPieceDrop,
                boardOrientation: playerColor,
                showNotation: !hidePieces,
                ...(hidePieces ? { pieces: invisiblePieces } : {}),
                ...(showMissingPieceTray && missingPieceSquare ? { pieces: buildPiecesHidingSquare(missingPieceSquare) } : {}),
                squareStyles: hidePieces ? {} : {
                  ...(setupMoveSquares
                    ? {
                        [setupMoveSquares.from]: { backgroundColor: 'rgba(176, 141, 87, 0.35)' },
                        [setupMoveSquares.to]: { backgroundColor: 'rgba(176, 141, 87, 0.35)' }
                      }
                    : {}),
                  ...(hintSquare ? { [hintSquare]: { backgroundColor: 'rgba(91, 123, 111, 0.45)' } } : {}),
                  ...(checkSquare ? { [checkSquare]: { backgroundColor: 'rgba(221, 0, 0, 0.55)' } } : {}),
                  ...(showMissingPieceTray && missingPieceSquare
                    ? { [missingPieceSquare]: { backgroundColor: 'rgba(255, 176, 0, 0.75)', boxShadow: 'inset 0 0 0 4px rgba(166, 67, 47, 0.9)' } }
                    : {})
                }
              }}
            />

            {mode === 'streak' && (
              <div style={{
                marginTop: '12px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: colors.surfaceHover,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (timeRemaining / streakTimerStartSeconds) * 100)}%`,
                  backgroundColor: colors.danger,
                  transition: 'width 0.3s linear',
                }} />
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 260px', marginTop: '50px' }}>
            {mode === 'streak' && (
              <div style={{
                backgroundColor: colors.surface,
                padding: '20px 22px',
                borderRadius: '6px',
                borderLeft: `4px solid ${timeRemaining <= 5 ? colors.danger : colors.primary}`,
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.textPrimary, fontFamily: fonts.display }}>Score: {score}</div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  fontFamily: fonts.display,
                  color: timeRemaining <= 5 ? colors.danger : colors.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Timer size={20} /> {timeRemaining}s
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.danger, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {streak >= 3 ? <Flame size={20} /> : <Zap size={20} />} {streak}
                </div>
              </div>
            )}

            <div style={{ backgroundColor: colors.surface, padding: '24px', borderRadius: '6px', borderLeft: `6px solid ${colors.primary}`, minHeight: '260px' }}>
              <h3 style={{ marginTop: 0, fontFamily: fonts.display, fontWeight: 600, color: colors.textPrimary, borderBottom: `1px solid ${colors.primaryLight}`, paddingBottom: '12px' }}>
                Move History
              </h3>
              {movePairs.length === 0 ? (
                <p style={{ color: colors.textSecondary, fontStyle: 'italic', fontSize: '14px' }}>Make a move to start…</p>
              ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '1.05rem' }}>
                  <tbody>
                    {movePairs.map((pair, index) => (
                      <tr key={index} style={{ borderBottom: `1px solid ${colors.surfaceHover}` }}>
                        <td style={{ padding: '8px 0', color: colors.textSecondary, width: '32px' }}>{index + 1}.</td>
                        <td style={{ padding: '8px 0', fontWeight: 600, color: colors.textPrimary }}>{pair.white}</td>
                        <td style={{ padding: '8px 0', fontWeight: 600, color: colors.textPrimary }}>{pair.black}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{
              backgroundColor: colors.surface,
              padding: '24px',
              borderRadius: '6px',
              borderLeft: `6px solid ${colors.primary}`,
              marginTop: '20px',
              textAlign: 'center',
            }}>
              <p style={{
                margin: '0 0 18px 0',
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: '1.15rem',
                color: statusColor,
              }}>
                {statusLabel}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={resetPuzzle}
                  style={{ padding: '13px 26px', cursor: 'pointer', borderRadius: '4px', border: `1px solid ${colors.primary}`, backgroundColor: 'transparent', color: colors.textPrimary, fontFamily: fonts.body, fontSize: '1.05rem' }}
                >
                  Retry
                </button>
                {!isSolved && mode !== 'blackout' && !showMissingPieceTray && (
                  <button
                    onClick={getHint}
                    style={{ padding: '13px 26px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: colors.danger, color: colors.surface, fontFamily: fonts.body, fontSize: '1.05rem' }}
                  >
                    {mode === 'streak' ? 'Hint (ends streak)' : 'Hint'}
                  </button>
                )}
                {isSolved && mode === 'shared' && (
                  <button
                    onClick={onBack}
                    style={{ padding: '13px 26px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: colors.success, color: colors.surface, fontFamily: fonts.body, fontSize: '1.05rem' }}
                  >
                    Back to Menu
                  </button>
                )}
                {isSolved && mode !== 'shared' && (
                  <button
                    onClick={nextPuzzle}
                    style={{ padding: '13px 26px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: colors.success, color: colors.surface, fontFamily: fonts.body, fontSize: '1.05rem' }}
                  >
                    Next Puzzle →
                  </button>
                )}
              </div>
            </div>

            {positionHistoryLength > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginTop: '16px',
              }}>
                <button
                  onClick={() => setViewIndex((prev) => Math.max(0, prev - 1))}
                  disabled={viewIndex === 0}
                  style={{
                    padding: '10px 18px',
                    cursor: viewIndex === 0 ? 'default' : 'pointer',
                    borderRadius: '4px',
                    border: `1px solid ${colors.primary}`,
                    backgroundColor: 'transparent',
                    color: colors.surface,
                    fontFamily: fonts.body,
                    fontSize: '1.05rem',
                    opacity: viewIndex === 0 ? 0.4 : 1,
                  }}
                >
                  ← Prev
                </button>
                <span style={{ color: colors.surfaceHover, fontFamily: fonts.body, fontSize: '0.9rem' }}>
                  Move {viewIndex} / {positionHistoryLength - 1}
                </span>
                <button
                  onClick={() => setViewIndex((prev) => Math.min(positionHistoryLength - 1, prev + 1))}
                  disabled={viewIndex === positionHistoryLength - 1}
                  style={{
                    padding: '10px 18px',
                    cursor: viewIndex === positionHistoryLength - 1 ? 'default' : 'pointer',
                    borderRadius: '4px',
                    border: `1px solid ${colors.primary}`,
                    backgroundColor: 'transparent',
                    color: colors.surface,
                    fontFamily: fonts.body,
                    fontSize: '1.05rem',
                    opacity: viewIndex === positionHistoryLength - 1 ? 0.4 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
