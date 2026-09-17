import { colors, fonts } from '../../config/theme';

export default function PageHeader({ title, subtitle }) {
  return (
    <header style={{ textAlign: 'center', marginBottom: '48px' }}>
      <h1 style={{
        fontFamily: fonts.display,
        fontWeight: 600,
        fontSize: '2.75rem',
        color: colors.textInverted,
        margin: '0 0 14px 0',
      }}>
        {title}
      </h1>
      <div style={{ width: '56px', height: '3px', backgroundColor: colors.primary, margin: subtitle ? '0 auto 16px' : '0 auto' }} />
      {subtitle && (
        <p style={{ color: colors.surfaceHover, fontSize: '1.05rem', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </header>
  );
}