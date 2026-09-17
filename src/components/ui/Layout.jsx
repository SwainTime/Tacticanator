import {colors, fonts } from '../../config/theme';
import GlobalStyle from './GlobalStyle';

export default function Layout({children}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      backgroundImage: `radial-gradient(ellipse at top, ${colors.backgroundDeep} 0%, ${colors.background} 60%)`,
      padding: '40px 20px',
      fontFamily: fonts.body,
    }}>
      <GlobalStyle />
      {children}
    </div>
  );
}