import { colors } from '../../config/theme';

export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        padding: 0;
        min-height: 100%;
        background-color: ${colors.background};
      }

      body {
        display: block;
        place-items: unset;
        min-width: unset;
      }

      #root {
        max-width: none;
        margin: 0;
        padding: 0;
        text-align: left;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }
      }

      button:focus-visible, [role="button"]:focus-visible {
        outline: 2px solid ${colors.primary};
        outline-offset: 2px;
      }
    `}</style>
  );
}