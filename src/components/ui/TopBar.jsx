import {useState} from 'react';
import {Pencil} from 'lucide-react';
import {loadUsername, saveUsername} from '../../utils/storage'
import { colors, fonts } from '../../config/theme';
import { pieceImageUrl } from '../../utils/chessHelpers';

export function TopBar({rating, onGoHome, user, onOpenAuth, onSignOut}) {
    const [userName, setUserName] = useState(() => loadUsername() || 'Guest');
    const [isEditing, setIsEditing] = useState(false);

    const displayName = user ? user.email.split('@')[0] : userName;

    function handleSaveName(e) {
        if (e.key === 'Enter') {
            const trimmed = userName.trim();
            if (trimmed) {
                setUserName(trimmed);
                saveUsername(trimmed);
            }
            setIsEditing(false);
        }
    }

    return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 32px',
      backgroundColor: colors.topBarBackground,
      borderBottom: `1px solid ${colors.primary}`,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
    }}>
      <div
        onClick={onGoHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onGoHome(); }}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <img
          src={pieceImageUrl('n', 'w')}
          alt=""
          width="30"
          height="30"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5))' }}
        />
        <span style={{
          fontFamily: fonts.display,
          fontSize: '1.3rem',
          fontWeight: 600,
          color: colors.textInverted,
          letterSpacing: '0.02em',
        }}>
          Tacticanator
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          {user ? (
            <div style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.textInverted, fontSize: '0.95rem' }}>
              {displayName}
            </div>
          ) : isEditing ? (
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={handleSaveName}
              onBlur={() => setIsEditing(false)}
              autoFocus
              style={{
                background: 'rgba(250, 243, 228, 0.08)',
                color: colors.textInverted,
                border: `1px solid ${colors.primary}`,
                borderRadius: '4px',
                padding: '3px 8px',
                textAlign: 'right',
                fontFamily: fonts.body,
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing(true); }}
              style={{
                cursor: 'pointer',
                fontFamily: fonts.body,
                fontWeight: 600,
                color: colors.textInverted,
                fontSize: '0.95rem',
              }}
            >
              {userName} <Pencil size={12} color={colors.primaryLight} style={{ verticalAlign: 'middle' }} />
            </div>
          )}
          <div style={{
            fontFamily: fonts.body,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgba(250, 243, 228, 0.55)',
          }}>
          </div>
        </div>

        <button
          onClick={user ? onSignOut : onOpenAuth}
          style={{
            padding: '7px 14px',
            cursor: 'pointer',
            borderRadius: '4px',
            border: `1px solid ${colors.primary}`,
            backgroundColor: 'transparent',
            color: colors.textInverted,
            fontFamily: fonts.body,
            fontSize: '0.8rem',
          }}
        >
          {user ? 'Sign Out' : 'Sign In'}
        </button>

        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: colors.success,
          border: `2px solid ${colors.primaryLight}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: '1rem',
          color: colors.textInverted,
          flexShrink: 0,
        }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );

}
