import {useState, useEffect, useRef} from 'react';
import {Chess} from 'chess.js';
import {fetchPuzzles} from '../utils/api';
import {playMoveSound} from '../utils/audio';
import {getCheckSquare} from '../utils/chessHelpers';
import {computeNewRating, defaultRating} from '../utils/eloRating';
import {loadDaily, saveDaily, loadBlackoutRating, saveBlackoutRating, loadMissingPieceRating, saveMissingPieceRating} from '../utils/storage';
import {colors} from '../config/theme';
import {streakTimerStartSeconds, streakTimerBonusSeconds, streakPuzzleCompleteBonusSeconds, blackoutRevealSeconds} from '../config/constants';

export function usePuzzleEngine({ mode, theme, generalRating, onGeneralRatingChange, onSwitchMode }) {
  const [activePuzzles, setActivePuzzles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakRating, setStreakRating] = useState(defaultRating);
  const [hintSquare, setHintSquare] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [setupMoveSquares, setSetupMoveSquares] = useState(null);
  const [moveStatus, setMoveStatus] = useState('idle'); // 'idle' | 'correct' | 'wrong' | 'hint'
  const [showGameOver, setShowGameOver] = useState(false);
  const [lastRunScore, setLastRunScore] = useState(0);
  const [ratingDelta, setRatingDelta] = useState(null);
  const [hintEndsStreak, setHintEndsStreak] = useState(false);
  const [positionHistory, setPositionHistory] = useState([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(streakTimerStartSeconds);
  const [blackoutRating, setBlackoutRating] = useState(loadBlackoutRating);
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [missingPieceRating, setMissingPieceRating] = useState(loadMissingPieceRating);
  const [pieceGuessed, setPieceGuessed] = useState(false);
  const alreadyRated = useRef(false);

  // Streak mode gets its own scaling difficulty that always starts at defaultRat ing and fully resets on a miss; Blackout and Missing Piece modes each have their own persisted rating, separate from the shared pool; every other mode (casual, thematic, daily) shares generalRating.
  const activeRating = mode === 'streak'
    ? streakRating
    : mode === 'blackout'
      ? blackoutRating
      : mode === 'missingPiece'
        ? missingPieceRating
        : generalRating;

  useEffect(() => {
    if (mode === 'blackout') saveBlackoutRating(blackoutRating);
  }, [blackoutRating]);

  useEffect(() => {
    if (mode === 'missingPiece') saveMissingPieceRating(missingPieceRating);
  }, [missingPieceRating]);

  // prevent state updates on unmounted component
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPuzzles(mode, theme, activeRating);
        if (isMounted) {
          setActivePuzzles(data);
          setPuzzleIndex(0);
        }
      } catch (err) {
        if (isMounted) setError("Failed to fetch puzzle data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [mode, theme]);

  function initializePuzzle(puzzle) {
    setGame(new Chess(puzzle.fen));
    setMoveIndex(0);
    setIsSolved(false);
    setHintSquare(null);
    setPendingPromotion(null);
    setMoveStatus('idle');
    setRatingDelta(null);
    setHintEndsStreak(false);
    setPositionHistory([puzzle.fen]);
    setViewIndex(0);
    alreadyRated.current = false;
    setRevealKey((key) => key + 1);
    setPieceGuessed(false);
    setSetupMoveSquares(
      puzzle.lastMove
        ? { from: puzzle.lastMove.substring(0, 2), to: puzzle.lastMove.substring(2, 4) }
        : null
    );
  }

  useEffect(() => {
    if (activePuzzles.length > 0) {
      initializePuzzle(activePuzzles[puzzleIndex]);
    }
  }, [puzzleIndex, activePuzzles]);

  useEffect(() => {
    if (mode !== 'blackout' || activePuzzles.length === 0) return;

    setIsBlackedOut(false);
    const timeoutId = setTimeout(() => setIsBlackedOut(true), blackoutRevealSeconds * 1000);
    return () => clearTimeout(timeoutId);
  }, [mode, revealKey, activePuzzles.length]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') {
        setViewIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setViewIndex((prev) => Math.min(positionHistory.length - 1, prev + 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [positionHistory.length]);

  // Streak mode's countdown ticks once a second while a puzzle is actually
  // in play, and pauses during loading/solved/game-over states.
  useEffect(() => {
    if (mode !== 'streak' || isLoading || isSolved || showGameOver || error) return;

    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [mode, isLoading, isSolved, showGameOver, error]);

  // Running out the clock ends the streak the same way a wrong move does.
  useEffect(() => {
    if (mode !== 'streak' || showGameOver) return;
    if (timeRemaining > 0 || isLoading || activePuzzles.length === 0) return;

    setLastRunScore(score);
    setStreak(0);
    setScore(0);
    setShowGameOver(true);
    rateResult(false);
  }, [timeRemaining]);

  function rateResult(won) {
    if (alreadyRated.current) return;
    alreadyRated.current = true;
    const currentPuzzle = activePuzzles[puzzleIndex];

    if (mode === 'streak') {
      // A miss wipes the run's scaling difficulty back to the baseline rather than nudging it down like a normal loss would.
      setStreakRating((prev) => {
        const next = won ? computeNewRating(prev, currentPuzzle.rating, true) : defaultRating;
        setRatingDelta(next - prev);
        return next;
      });
      return;
    }

    if (mode === 'daily') {
      // Only the first attempt at a given day's puzzle counts, replaying it shouldn't move the rating again.
      if (loadDaily() === currentPuzzle.id) {
        setRatingDelta(null);
        return;
      }
      saveDaily(currentPuzzle.id);
    }

    if (mode === 'blackout') {
      const nextBlackoutRating = computeNewRating(blackoutRating, currentPuzzle.rating, won);
      setRatingDelta(nextBlackoutRating - blackoutRating);
      setBlackoutRating(nextBlackoutRating);
      return;
    }

    if (mode === 'missingPiece') {
      const nextMissingPieceRating = computeNewRating(missingPieceRating, currentPuzzle.rating, won);
      setRatingDelta(nextMissingPieceRating - missingPieceRating);
      setMissingPieceRating(nextMissingPieceRating);
      return;
    }

    const nextRating = computeNewRating(generalRating, currentPuzzle.rating, won);
    setRatingDelta(nextRating - generalRating);
    onGeneralRatingChange(nextRating);
  }

  function pushPosition(fen) {
    setPositionHistory((prev) => {
      const next = [...prev, fen];
      setViewIndex(next.length - 1);
      return next;
    });
  }

  function executeMove(sourceSquare, targetSquare, promotionPiece) {
    const currentPuzzle = activePuzzles[puzzleIndex];
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());

    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionPiece || 'q'
      });

      if (move) {
        playMoveSound();
        const playerMoveString = sourceSquare + targetSquare + (move.promotion || '');
        const expectedCorrectMove = currentPuzzle.solution[moveIndex];

        if (playerMoveString === expectedCorrectMove) {
          setGame(gameCopy);
          pushPosition(gameCopy.fen());
          let updatedScore = score;
          if (mode === 'streak') {
            updatedScore = score + 100 + (streak * 50);
            setStreak(streak + 1);
            setScore(updatedScore);
          }
          setMoveStatus('correct');

          // Every correct move buys a little more time, not just full solves.
          if (mode === 'streak') {
            setTimeRemaining((prev) => prev + streakTimerBonusSeconds);
          }

          const endStreakIfHinted = () => {
            if (mode === 'streak' && hintEndsStreak) {
              setLastRunScore(updatedScore);
              setStreak(0);
              setScore(0);
              setShowGameOver(true);
            }
          };

          // On top of the per-move bonus, finishing the whole puzzle earns extra time.
          const addPuzzleCompleteBonus = () => {
            if (mode === 'streak') {
              setTimeRemaining((prev) => prev + streakPuzzleCompleteBonusSeconds);
            }
          };

          if (moveIndex + 1 === currentPuzzle.solution.length) {
            setIsSolved(true);
            rateResult(true);
            addPuzzleCompleteBonus();
            endStreakIfHinted();
          } else {
            setMoveIndex(moveIndex + 1);
            setTimeout(() => {
              const opponentGameCopy = new Chess();
              opponentGameCopy.loadPgn(gameCopy.pgn());
              const opponentMove = currentPuzzle.solution[moveIndex + 1];
              const opponentPromotion = opponentMove.length > 4 ? opponentMove.substring(4) : 'q';

              opponentGameCopy.move({
                from: opponentMove.substring(0, 2),
                to: opponentMove.substring(2, 4),
                promotion: opponentPromotion
              });
              playMoveSound();

              setGame(opponentGameCopy);
              pushPosition(opponentGameCopy.fen());
              // +2 because the opponent's move is the next one in the solution, so we skip over it to get to the player's next move.
              if (moveIndex + 2 === currentPuzzle.solution.length) {
                setIsSolved(true);
                rateResult(true);
                addPuzzleCompleteBonus();
                endStreakIfHinted();
              } else {
                setMoveIndex(moveIndex + 2);
              }
            }, 500);
          }
          return true;
        } else {
          if (mode === 'streak') {
            setLastRunScore(score);
            setStreak(0);
            setScore(0);
            setShowGameOver(true);
          }
          rateResult(false);
          setMoveStatus('wrong');
          return false;
        }
      }
    } catch (error) { return false; }
    return false;
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (isSolved || activePuzzles.length === 0) return false;
    if (viewIndex !== positionHistory.length - 1) return false;
    if (mode === 'blackout' && !isBlackedOut) return false;
    if (mode === 'missingPiece' && !pieceGuessed) return false;

    setHintSquare(null);
    setSetupMoveSquares(null);
    setMoveStatus('idle');

    const piece = game.get(sourceSquare);
    const legalMoves = game.moves({square: sourceSquare, verbose: true});
    const isLegalPromotion = piece?.type === 'p' &&
      legalMoves.some((legalMove) => legalMove.to === targetSquare && legalMove.promotion);

    if (isLegalPromotion) {
      setPendingPromotion({sourceSquare, targetSquare, color: piece.color});
      return false;
    }

    return executeMove(sourceSquare, targetSquare, null);
  }

  function handlePromotionChoice(piece) {
    const {sourceSquare, targetSquare} = pendingPromotion;
    setPendingPromotion(null);
    executeMove(sourceSquare, targetSquare, piece);
  }

  // Missing Piece mode: the player clicks a piece from the tray to guess
  // what belongs on the blanked square (always the square the first
  // solving move starts from). A wrong guess counts exactly like a wrong
  // move elsewhere — it doesn't lock the tray, so they can keep guessing,
  // but only the first wrong guess on a given attempt costs rating.
  function guessPiece(code) {
    if (mode !== 'missingPiece' || pieceGuessed || activePuzzles.length === 0) return;
    const currentPuzzle = activePuzzles[puzzleIndex];
    const missingSquare = currentPuzzle.solution[0].substring(0, 2);
    const actualPiece = game.get(missingSquare);
    const actualCode = actualPiece ? `${actualPiece.color}${actualPiece.type.toUpperCase()}` : null;

    if (code === actualCode) {
      setPieceGuessed(true);
      setMoveStatus('idle');
    } else {
      rateResult(false);
      setMoveStatus('wrong');
    }
  }

  function getHint() {
    if (isSolved || activePuzzles.length === 0) return;
    const expectedCorrectMove = activePuzzles[puzzleIndex].solution[moveIndex];
    const source = expectedCorrectMove.substring(0, 2);
    setHintSquare(source);
    setMoveStatus('hint');
    setViewIndex(positionHistory.length - 1);
    // The streak already counts as lost, but let the player finish this puzzle before ending the run.
    if (mode === 'streak') setHintEndsStreak(true);
    rateResult(false);
  }

  async function nextPuzzle() {
    if (mode === 'daily') {
      onSwitchMode('casual');
      return;
    }

    if (mode === 'streak' || mode === 'thematic' || mode === 'casual' || mode === 'blackout' || mode === 'missingPiece') {
      setIsLoading(true);
      try {
        const data = await fetchPuzzles(mode, theme, activeRating);
        setActivePuzzles(data);
        setPuzzleIndex(0);
      } catch (err) {
        setError("Failed to fetch next puzzle.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (puzzleIndex < activePuzzles.length - 1) {
      setPuzzleIndex(puzzleIndex + 1);
    } else {
      setPuzzleIndex(0);
    }
  }

  function startNewStreak() {
    setShowGameOver(false);
    setTimeRemaining(streakTimerStartSeconds);
    nextPuzzle();
  }

  function resetPuzzle() {
    if (activePuzzles.length > 0) {
      setRatingDelta(null);

      if (mode === 'blackout' || mode === 'missingPiece') rateResult(false);

      const puzzle = activePuzzles[puzzleIndex];
      setGame(new Chess(puzzle.fen));
      setMoveIndex(0);
      setIsSolved(false);
      setStreak(0);
      setHintSquare(null);
      setPendingPromotion(null);
      setMoveStatus('idle');
      setPositionHistory([puzzle.fen]);
      setViewIndex(0);
      setRevealKey((key) => key + 1);
      setPieceGuessed(false);
    }
  }

  const currentPuzzle = activePuzzles[puzzleIndex];
  const playerColor = currentPuzzle
    ? (new Chess(currentPuzzle.fen).turn() === 'w' ? 'white' : 'black')
    : 'white';
  const history = game.history();
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({white: history[i], black: history[i + 1] || ''});
  }

  // The arrow buttons let the player step through positionHistory at any time
  // viewIndex tracks the live position automatically through pushPosition until they scroll back, so this shows the live game unless they've deliberately browsed to an earlier move.
  const displayedFen = positionHistory[viewIndex] || game.fen();
  const displayedGame = displayedFen !== game.fen() ? new Chess(displayedFen) : game;
  const checkSquare = getCheckSquare(displayedGame);

  // The square the puzzle's first solving move starts from — blanked out
  // until the player correctly identifies what piece belongs there.
  const missingPieceSquare = mode === 'missingPiece' && currentPuzzle
    ? currentPuzzle.solution[0].substring(0, 2)
    : null;

  const ratingDeltaText = mode !== 'streak' && ratingDelta != null ? ` (${ratingDelta > 0 ? '+' : ''}${ratingDelta})` : '';
  const statusLabel = isSolved
    ? `Solved! ✓${ratingDeltaText}`
    : mode === 'missingPiece' && !pieceGuessed
      ? (moveStatus === 'wrong' ? `Wrong piece${ratingDeltaText}` : `Which piece belongs here?${ratingDeltaText}`)
      : moveStatus === 'wrong'
        ? `Wrong move${ratingDeltaText}`
        : moveStatus === 'hint'
          ? `Hint used${ratingDeltaText}`
          : moveStatus === 'correct'
            ? 'Correct'
            : mode === 'blackout' && !isBlackedOut
              ? `Memorize the position…${ratingDeltaText}`
              : mode === 'blackout'
                ? 'Solve it from memory'
                : mode === 'missingPiece'
                  ? 'Now play the move'
                  : 'Make your move';
  const statusColor = isSolved
    ? colors.success
    : (mode === 'missingPiece' && !pieceGuessed && (moveStatus === 'wrong' || ratingDelta != null))
      ? colors.danger
      : moveStatus === 'wrong' || moveStatus === 'hint'
      ? colors.danger
      : moveStatus === 'correct'
        ? colors.success
        : mode === 'blackout' && !isBlackedOut && ratingDelta != null
          ? colors.danger
          : colors.textSecondary;

  return {
    state: {
      isLoading,
      error,
      game,
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
      currentPuzzleRating: activePuzzles[puzzleIndex]?.rating,
      moveStatus,
      statusLabel,
      statusColor,
      isSolved,
      viewIndex,
      positionHistoryLength: positionHistory.length,
      pendingPromotion,
      showGameOver,
      lastRunScore,
      setupMoveSquares,
      hintSquare
    },
    actions: {
      onPieceDrop,
      handlePromotionChoice,
      getHint,
      guessPiece,
      resetPuzzle,
      nextPuzzle,
      startNewStreak,
      setViewIndex
    }
  };
}
