import { colors } from '../../config/theme';

export default function IconBadge({ icon, size = 56 }) {
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
      fontSize: size * 0.45,
      margin: '0 auto 18px',
    }}>
      {icon}
    </div>
  );
}