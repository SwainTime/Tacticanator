import {useEffect, useState} from 'react';
import {supabase} from '../utils/supabaseClient';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {data: subscription} = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signUp(email, password) {
    const {data, error} = await supabase.auth.signUp({ email, password });
    if (error) return {error: error.message};
    if (!data.session) return { needsEmailConfirmation: true };
    return {};
  }

  async function signIn(email, password) {
    const {error} = await supabase.auth.signInWithPassword({email, password});
    if (error) return {error: error.message};
    return {};
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return {
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
