'use client'
import React, { useEffect, useState } from "react"
import { createClient } from "../supabase/client";
import { deriveEncryptionSession } from "./encryption";

const useMessageEncryption = () => {
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);

    useEffect(() => {
        const initializeEncryption = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token && session.user.email) {
                try {
                    const key = await deriveEncryptionSession(session.access_token, session.user.email);
                    setEncryptionKey(key);
                    setIsReady(true);
                } catch (error) {
                    console.error('Failed to derive encryption key:', error);
                    setIsReady(false);
                }
            } else {
                setIsReady(false);
            }
        }
        initializeEncryption();

        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    initializeEncryption();
                } else if (event === 'SIGNED_OUT') {
                    setEncryptionKey(null);
                    setIsReady(false);
                }
            }
        );
        return () => subscription.unsubscribe();
    }, [])
    
  return { encryptionKey, isReady };
}

export default useMessageEncryption