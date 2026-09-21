import {useEffect, useRef, useState} from 'react';
import {defaultRating} from '../utils/eloRating';
import {
  loadRating, saveRating,
  loadBlackoutRating, saveBlackoutRating,
  loadMissingPieceRating, saveMissingPieceRating,
} from '../utils/storage';
import {loadProfileRatings, saveProfileRatings} from '../utils/profileApi';

function readLocalRatings() {
  return {
    general: loadRating(),
    blackout: loadBlackoutRating(),
    missingPiece: loadMissingPieceRating(),
  };
}

const saveLocal = {
  general: saveRating,
  blackout: saveBlackoutRating,
  missingPiece: saveMissingPieceRating,
};

export function useRatings(user) {
  const userId = user?.id ?? null;
  const [ratings, setRatings] = useState(readLocalRatings);
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    if (!userId) {
      if (wasLoggedIn.current) {
        wasLoggedIn.current = false;
        setRatings(readLocalRatings());
      }
      return;
    }
    wasLoggedIn.current = true;

    let cancelled = false;
    loadProfileRatings(userId).then((profile) => {
      if (cancelled || !profile) return;

      const local = readLocalRatings();
      const profileIsFresh = Object.values(profile).every((value) => value === defaultRating);
      const localHasProgress = Object.values(local).some((value) => value !== defaultRating);
      if (profileIsFresh && localHasProgress) {
        setRatings(local);
        saveProfileRatings(userId, local);
      } else {
        setRatings(profile);
      }
    });

    return () => { cancelled = true; };
  }, [userId]);

  function updateRating(key, value) {
    setRatings((prev) => ({...prev, [key]: value}));
    if (userId) saveProfileRatings(userId, {[key]: value});
    else saveLocal[key](value);
  }

  return {
    generalRating: ratings.general,
    blackoutRating: ratings.blackout,
    missingPieceRating: ratings.missingPiece,
    setGeneralRating: (value) => updateRating('general', value),
    setBlackoutRating: (value) => updateRating('blackout', value),
    setMissingPieceRating: (value) => updateRating('missingPiece', value),
  };
}
