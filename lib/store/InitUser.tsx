'use client'
import { useEffect, useRef } from 'react'
import { useUser } from './user';
import { createClient } from '@/app/utils/supabase/client';

export default function InitUser() {
  const initState = useRef(false);

  useEffect(() => {
    if (!initState.current) {
      const supabase = createClient();
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        useUser.setState({ user: session?.user });
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          useUser.setState({ user: session?.user });
        }
      );

      initState.current = true;

      return () => subscription.unsubscribe();
    }
  }, []);

  return null;
}