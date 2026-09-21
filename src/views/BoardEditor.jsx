import {useRef, useState} from 'react';
import {Chess, validateFen} from 'chess.js';
import {Chessboard} from 'react-chessboard';
import {Trash2} from 'lucide-react';

import Layout from '../components/ui/Layout';
import PageHeader from '../components/ui/PageHeader';
import {colors, fonts, backButtonStyle} from '../config/theme';
import {pieceCodes, pieceImageUrl} from '../utils/chessHelpers';

const actionButtonStyle = {
  padding: '12px 22px',
  cursor: 'pointer',
  borderRadius: '4px',
  border: `1px solid ${colors.primary}`,
  backgroundColor: 'transparent',
  color: colors.textPrimary,
  fontFamily: fonts.body,
  fontSize: '1rem',
};

const primaryButtonStyle = {
  ...actionButtonStyle,
  border: 'none',
  backgroundColor: colors.success,
  color: colors.surface,
};

function PanelCard({children}) {
  return (
    <div style={{ backgroundColor: colors.surface, padding: '24px', borderRadius: '6px', borderLeft: `6px solid ${colors.primary}` }}>
      {children}
    </div>
  );
}

export default function BoardEditor({onBack}) {
  const gameRef = useRef(new Chess());
  const recordGameRef = useRef(null);

  const [fen, setFen] = useState(gameRef.current.fen());
  const [selectedTool, setSelectedTool] = useState(null); // {type,color} | 'erase' | null
  const [setupError, setSetupError] = useState(null);

  const [phase, setPhase] = useState('setup'); // 'setup' | 'recording' | 'share'
  const [startingFen, setStartingFen] = useState(null);
  const [recordFen, setRecordFen] = useState(null);
  const [recordedMoves, setRecordedMoves] = useState([]);

  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  function handleSquareClick({square}) {
    if (!selectedTool) return;
    if (selectedTool === 'erase') {
      gameRef.current.remove(square);
    } else {
      const existing = gameRef.current.get(square);
      if (existing && existing.type === selectedTool.type && existing.color === selectedTool.color) {
        gameRef.current.remove(square);
      } else {
        gameRef.current.put(selectedTool, square);
      }
    }
    setFen(gameRef.current.fen());
    setSetupError(null);
  }

  function clearBoard() {
    gameRef.current.clear();
    setFen(gameRef.current.fen());
    setSetupError(null);
  }

  function resetToStartPosition() {
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setSetupError(null);
  }

  function toggleSideToMove() {
    gameRef.current.setTurn(gameRef.current.turn() === 'w' ? 'b' : 'w');
    setFen(gameRef.current.fen());
  }

  function startRecording() {
    const {ok, error} = validateFen(fen);
    if (!ok) {
      setSetupError(error || 'This position is not legal yet.');
      return;
    }
    recordGameRef.current = new Chess(fen);
    setStartingFen(fen);
    setRecordedMoves([]);
    setRecordFen(recordGameRef.current.fen());
    setPhase('recording');
  }

  function handleRecordDrop({sourceSquare, targetSquare}) {
    const move = recordGameRef.current.move({from: sourceSquare, to: targetSquare, promotion: 'q'});
    if (!move) return false;
    setRecordedMoves((prev) => [...prev, sourceSquare + targetSquare + (move.promotion || '')]);
    setRecordFen(recordGameRef.current.fen());
    return true;
  }

  function undoLastMove() {
    recordGameRef.current.undo();
    setRecordedMoves((prev) => prev.slice(0, -1));
    setRecordFen(recordGameRef.current.fen());
  }

  function finishAndShare() {
    const puzzle = {
      id: `custom-${Date.now()}`,
      title: 'Shared Puzzle',
      rating: null,
      fen: startingFen,
      solution: recordedMoves,
      lastMove: null,
    };
    const encoded = encodeURIComponent(btoa(JSON.stringify(puzzle)));
    setShareLink(`${window.location.origin}${window.location.pathname}?puzzle=${encoded}`);
    setPhase('share');
  }

  async function copyLink() {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  }

  function makeAnother() {
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setSelectedTool(null);
    setSetupError(null);
    setRecordedMoves([]);
    setShareLink('');
    setPhase('setup');
  }

  const sideToMove = fen.split(' ')[1] === 'b' ? 'Black' : 'White';
  const recordingOrientation = startingFen && new Chess(startingFen).turn() === 'b' ? 'black' : 'white';

  return (
    <Layout>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <button onClick={onBack} style={backButtonStyle}>← Back to Menu</button>

        <PageHeader
          title="Puzzle Editor"
          subtitle={
            phase === 'setup'
              ? 'Set up a position, then record the solution.'
              : phase === 'recording'
                ? 'Play out the solution.'
                : 'Share your puzzle.'
          }
        />

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {phase === 'setup' && (
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
                const isSelected = selectedTool !== null && selectedTool !== 'erase' &&
                  selectedTool.type === pieceType && selectedTool.color === pieceColor;
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedTool({ type: pieceType, color: pieceColor })}
                    title={code}
                    style={{
                      width: '62px',
                      height: '62px',
                      padding: 0,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      border: isSelected ? `3px solid ${colors.danger}` : `1px solid ${colors.primaryLight}`,
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
              <button
                onClick={() => setSelectedTool('erase')}
                title="Remove piece"
                style={{
                  width: '62px',
                  height: '62px',
                  padding: 0,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  border: selectedTool === 'erase' ? `3px solid ${colors.danger}` : `1px solid ${colors.primaryLight}`,
                  backgroundColor: colors.surfaceHover,
                  fontSize: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={26} color={colors.textSecondary} />
              </button>
            </div>
          )}

          <div style={{ flex: '3 1 460px', minWidth: '320px' }}>
            {phase === 'setup' && (
              <Chessboard
                options={{
                  position: fen,
                  onSquareClick: handleSquareClick,
                  allowDragging: false,
                }}
              />
            )}
            {phase !== 'setup' && (
              <Chessboard
                options={{
                  position: phase === 'recording' ? recordFen : startingFen,
                  onPieceDrop: phase === 'recording' ? handleRecordDrop : undefined,
                  allowDragging: phase === 'recording',
                  boardOrientation: recordingOrientation,
                }}
              />
            )}
          </div>

          <div style={{flex: '1 1 260px'}}>
            {phase === 'setup' && (
              <PanelCard>
                <h3 style={{ marginTop: 0, fontFamily: fonts.display, fontWeight: 600, color: colors.textPrimary }}>
                  Set Up the Position
                </h3>
                <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.5 }}>
                  Pick a piece from the tray, then click a square to place it. Click a piece already on the board with the same tool selected to remove it, or use the eraser.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <button onClick={clearBoard} style={actionButtonStyle}>Clear Board</button>
                  <button onClick={resetToStartPosition} style={actionButtonStyle}>Starting Position</button>
                </div>
                <button onClick={toggleSideToMove} style={{ ...actionButtonStyle, marginBottom: '16px' }}>
                  {sideToMove} to move (click to flip)
                </button>
                {setupError && (
                  <p style={{ color: colors.danger, fontSize: '14px', fontWeight: 600 }}>{setupError}</p>
                )}
                <button onClick={startRecording} style={{ ...primaryButtonStyle, width: '100%' }}>
                  Make Solution →
                </button>
              </PanelCard>
            )}

            {phase === 'recording' && (
              <PanelCard>
                <h3 style={{ marginTop: 0, fontFamily: fonts.display, fontWeight: 600, color: colors.textPrimary }}>
                  Play the Solution
                </h3>
                <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.5 }}>
                  Play out every move of the intended solution, including replies. This is exactly what a solver will need to find.
                </p>
                <p style={{ color: colors.textPrimary, fontSize: '14px', minHeight: '20px' }}>
                  {recordedMoves.length === 0 ? 'No moves recorded yet.' : recordedMoves.join('  ')}
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                  <button onClick={undoLastMove} disabled={recordedMoves.length === 0} style={{ ...actionButtonStyle, opacity: recordedMoves.length === 0 ? 0.5 : 1 }}>
                    Undo Last Move
                  </button>
                  <button onClick={() => setPhase('setup')} style={actionButtonStyle}>
                    Back to Setup
                  </button>
                </div>
                <button
                  onClick={finishAndShare}
                  disabled={recordedMoves.length === 0}
                  style={{ ...primaryButtonStyle, width: '100%', marginTop: '16px', opacity: recordedMoves.length === 0 ? 0.5 : 1 }}
                >
                  Finish & Get Share Link
                </button>
              </PanelCard>
            )}

            {phase === 'share' && (
              <PanelCard>
                <h3 style={{ marginTop: 0, fontFamily: fonts.display, fontWeight: 600, color: colors.textPrimary }}>
                  Puzzle Ready!
                </h3>
                <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.5 }}>
                  Anyone with this link can open and play your puzzle.
                </p>
                <input
                  readOnly
                  value={shareLink}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.primaryLight}`,
                    fontFamily: fonts.body,
                    fontSize: '13px',
                    marginBottom: '12px',
                    color: colors.textPrimary,
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={copyLink} style={primaryButtonStyle}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button onClick={makeAnother} style={actionButtonStyle}>
                    Make Another
                  </button>
                </div>
              </PanelCard>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
