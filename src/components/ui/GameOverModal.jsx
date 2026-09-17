import { colors, fonts } from '../../config/theme';

export default function GameOverModal({ score, onStartNewStreak }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(20, 14, 8, 0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ backgroundColor: colors.surface, padding: '32px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${colors.primary}`, maxWidth: '340px' }}>
        <h2 style={{ marginTop: 0, fontFamily: fonts.display, fontWeight: 700, fontSize: '1.6rem', color: colors.danger }}>Game Over</h2>
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: '1rem', marginBottom: '24px' }}>
          Your streak is over. You scored {score} points this run.
        </p>
        <button
          onClick={onStartNewStreak}
          style={{ padding: '13px 26px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: colors.success, color: colors.surface, fontFamily: fonts.body, fontSize: '1.05rem' }}
        >
          Start New Streak ↺
        </button>
      </div>
    </div>
  );
}
