import { colors, fonts } from '../../config/theme';
import { pieceImageUrl } from '../../utils/chessHelpers';

export default function PromotionModal({ color, onSelect }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(20, 14, 8, 0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ backgroundColor: colors.surface, padding: '24px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${colors.primary}` }}>
        <p style={{ marginTop: 0, fontFamily: fonts.display, fontWeight: 600, color: colors.textPrimary }}>Promote to:</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['q', 'r', 'b', 'n'].map((p) => (
            <button
              key={p} onClick={() => onSelect(p)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '60px', height: '60px', cursor: 'pointer',
                border: `1px solid ${colors.primary}`, borderRadius: '6px',
                backgroundColor: color === 'w' ? colors.textInverted : colors.textPrimary
              }}
            >
              <img src={pieceImageUrl(p, color)} alt={p} width="40" height="40" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}