import {useState} from 'react';
import {useAuth} from './hooks/useAuth.js';
import {useRatings} from './hooks/useRatings.js';
import MainMenu from './views/MainMenu.jsx';
import ThemeMenu from './views/ThemeMenu.jsx';
import BoardEditor from './views/BoardEditor.jsx';
import PuzzleGame from './components/puzzle/PuzzleGame';
import {TopBar} from './components/ui/TopBar';
import AuthModal from './components/ui/AuthModal';

function readSharedPuzzleFromUrl() {
  try {
    const encoded = new URLSearchParams(window.location.search).get('puzzle');
    if (!encoded) return null;
    return JSON.parse(atob(decodeURIComponent(encoded)));
  } catch {
    return null;
  }
}

export default function App() {
  const [sharedPuzzle] = useState(readSharedPuzzleFromUrl);
  const [appState, setAppState] = useState(() =>
    sharedPuzzle ? { view: 'puzzle', mode: 'shared', theme: null } : { view: 'menu', mode: null, theme: null }
  );
  const {user, signUp, signIn, signOut} = useAuth();
  const {
    generalRating, setGeneralRating,
    blackoutRating, setBlackoutRating,
    missingPieceRating, setMissingPieceRating,
  } = useRatings(user);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const goHome = () => setAppState({ view: 'menu', mode: null, theme: null });

  let content;
  if (appState.view === 'menu') {
    content = (
      <MainMenu
        rating={generalRating}
        blackoutRating={blackoutRating}
        missingPieceRating={missingPieceRating}
        selectMode={(selectedMode) => setAppState({ view: 'puzzle', mode: selectedMode, theme: null })}
        thematic={() => setAppState({ view: 'thematicMenu', mode: null, theme: null })}
        editor={() => setAppState({ view: 'editor', mode: null, theme: null })}
      />
    );
  } else if (appState.view === 'thematicMenu') {
    content = (
      <ThemeMenu
        onSelectTheme={(selectedTheme) => setAppState({ view: 'puzzle', mode: 'thematic', theme: selectedTheme})}
        onBack={goHome}
      />
    );
  } else if (appState.view === 'editor') {
    content = <BoardEditor onBack={goHome} />;
  } else {
    content = (
      <PuzzleGame
        mode={appState.mode}
        theme={appState.theme}
        sharedPuzzle={appState.mode === 'shared' ? sharedPuzzle : null}
        generalRating={generalRating}
        onGeneralRatingChange={setGeneralRating}
        blackoutRating={blackoutRating}
        onBlackoutRatingChange={setBlackoutRating}
        missingPieceRating={missingPieceRating}
        onMissingPieceRatingChange={setMissingPieceRating}
        onSwitchMode={(newMode) => setAppState({ view: 'puzzle', mode: newMode, theme: null })}
        onBack={goHome}
      />
    );
  }

  return (
    <>
      <TopBar
        rating={generalRating}
        onGoHome={goHome}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={signOut}
      />
      {showAuthModal && (
        <AuthModal
          onSignIn={signIn}
          onSignUp={signUp}
          onClose={() => setShowAuthModal(false)}
        />
      )}
      {content}
    </>
  );
}