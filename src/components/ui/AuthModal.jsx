import { useState } from 'react';
import { colors, fonts } from '../../config/theme';

const inputStyle = {
  width: '100%',
  backgroundColor: colors.surface,
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '4px',
  border: `1px solid ${colors.primaryLight}`,
  fontFamily: fonts.body,
  fontSize: '14px',
  marginBottom: '12px',
  color: colors.textPrimary,
};

export default function AuthModal({ onSignIn, onSignUp, onClose }) {
  const [mode, setMode] = useState('signIn'); // 'signIn' | 'signUp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const result = mode === 'signIn' ? await onSignIn(email, password) : await onSignUp(email, password);

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else if (result.needsEmailConfirmation) {
      setInfo('Check your email to confirm your account, then sign in.');
    } else {
      onClose();
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.surface,
          borderRadius: '8px',
          padding: '28px',
          width: '340px',
          maxWidth: '90vw',
          borderLeft: `6px solid ${colors.primary}`,
        }}
      >
        <h3 style={{ marginTop: 0, fontFamily: fonts.display, fontWeight: 600, color: colors.textPrimary }}>
          {mode === 'signIn' ? 'Sign In' : 'Create an Account'}
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />

          {error && <p style={{ color: colors.danger, fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}
          {info && <p style={{ color: colors.success, fontSize: '13px', margin: '0 0 12px' }}>{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              cursor: submitting ? 'default' : 'pointer',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: colors.success,
              color: colors.surface,
              fontFamily: fonts.body,
              fontSize: '1rem',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Please wait…' : mode === 'signIn' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'signIn' ? 'signUp' : 'signIn'); setError(null); setInfo(null); }}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '8px',
            cursor: 'pointer',
            borderRadius: '4px',
            border: 'none',
            background: 'none',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            fontSize: '13px',
            textDecoration: 'underline',
          }}
        >
          {mode === 'signIn' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
