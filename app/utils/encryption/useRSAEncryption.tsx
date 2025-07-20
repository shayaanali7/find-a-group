'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import { generateRSAKeyPair, exportPublicKey, importPublicKey } from './RSAEncryption'
import { get, set } from 'idb-keyval'


declare global {
  interface Window {
    indexedDBPromise?: Promise<IDBDatabase>;
  }
}

interface RSAKeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

const useRSAEncryption = () => {
  const [keyPair, setKeyPair] = useState<RSAKeyPair | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initializeRSAEncryption = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user.id) {
        const uid = session.user.id
        setUserId(uid)

        try {
          const publicKeyData = await supabase
            .from('user_keys')
            .select('public_key')
            .eq('user_id', uid)
            .single()

          let publicKey: CryptoKey
          let privateKey: CryptoKey | null = null

          // Load private key from IndexedDB
          const privateKeyRaw = await get('rsa-private-key')
          if (privateKeyRaw) {
            privateKey = privateKeyRaw
          }

          if (publicKeyData.data) {
            publicKey = await importPublicKey(publicKeyData.data.public_key)
          } else {
            const newKeyPair = await generateRSAKeyPair()
            const exportedPub = await exportPublicKey(newKeyPair.publicKey)

            await supabase.from('user_keys').insert({
              user_id: uid,
              public_key: exportedPub,
              created_at: new Date().toISOString(),
            })

            await set('rsa-private-key', newKeyPair.privateKey)

            publicKey = newKeyPair.publicKey
            privateKey = newKeyPair.privateKey
          }

          if (publicKey && privateKey) {
            setKeyPair({ publicKey, privateKey })
            setIsReady(true)
          } else {
            console.warn('Private key not found locally. Unable to proceed securely.')
            setIsReady(false)
          }
        } catch (err) {
          console.error('Failed to initialize RSA encryption:', err)
          setIsReady(false)
        }
      }
    }

    initializeRSAEncryption()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        initializeRSAEncryption()
      } else if (event === 'SIGNED_OUT') {
        setKeyPair(null)
        setUserId(null)
        setIsReady(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { keyPair, isReady, userId }
}

export default useRSAEncryption
