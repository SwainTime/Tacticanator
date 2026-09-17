import { colors, fonts } from '../../config/theme';

export default function StatBadge({ label, value, accentColor = colors.primary }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: colors.surface,
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: '20px',
      padding: '8px 18px 8px 14px',
    }}>
      <span style={{ fontFamily: fonts.body, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textSecondary }}>
        {label}
      </span>
      <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.15rem', color: colors.textPrimary }}>
        {value}
      </span>
    </div>
  );
}
