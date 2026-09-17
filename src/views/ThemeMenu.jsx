import Layout from '../components/ui/Layout';
import PageHeader from '../components/ui/PageHeader';
import IconBadge from '../components/ui/IconBadge';
import {colors, fonts, backButtonStyle} from '../config/theme';
import {puzzleThemes} from '../config/constants';

export default function ThemeMenu({onSelectTheme, onBack}) {
  return (
    <Layout>
      <div style={{maxWidth: '920px', margin: '0 auto'}}>
        <button onClick={onBack} style={backButtonStyle}>← Back to Menu</button>

        <PageHeader title="Pick a Theme" subtitle="Train a specific tactic" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px' }}>
          {puzzleThemes.map((themeOption) => (
            <div
              key={themeOption.key}
              onClick={() => onSelectTheme(themeOption.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelectTheme(themeOption.key); }}
              style={{
                backgroundColor: colors.surface,
                borderLeft: `4px solid ${colors.primary}`,
                borderRadius: '6px',
                padding: '26px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, background-color 0.15s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.backgroundColor = colors.textInverted; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = colors.surface; }}
            >
              <IconBadge icon={themeOption.icon} size={48} />
              <h2 style={{fontFamily: fonts.display, fontWeight: 600, fontSize: '1.15rem', margin: '0 0 8px 0', color: colors.textPrimary }}>
                {themeOption.title}
              </h2>
              <p style={{color: colors.textSecondary, margin: 0, fontSize: '0.88rem', lineHeight: '1.45' }}>{themeOption.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}