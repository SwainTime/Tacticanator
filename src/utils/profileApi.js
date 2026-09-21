import {supabase} from './supabaseClient';

const columns = {
  general: 'general_rating',
  blackout: 'blackout_rating',
  missingPiece: 'missing_piece_rating',
};

export async function loadProfileRatings(userId) {
  const {data, error} = await supabase
    .from('profiles')
    .select(Object.values(columns).join(', '))
    .eq('id', userId)
    .single();

  if (error) return null;
  return {
    general: data.general_rating,
    blackout: data.blackout_rating,
    missingPiece: data.missing_piece_rating,
  };
}

export async function saveProfileRatings(userId, ratings) {
  const update = Object.fromEntries(
    Object.entries(ratings).map(([key, value]) => [columns[key], value])
  );
  const {error} = await supabase.from('profiles').update(update).eq('id', userId);
  if (error) console.error('Failed to save rating:', error.message);
}
