import { colors } from '../../config/theme';

export default function IconBadge({ icon: Icon, size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: `2px solid ${colors.primary}`,
      backgroundColor: 'rgba(176, 141, 87, 0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 18px',
    }}>
      <Icon size={size * 0.45} color={colors.primary} strokeWidth={1.75} />
    </div>
  );
}