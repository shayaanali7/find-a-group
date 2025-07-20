import { createClient } from "../supabase/client";

export const generateRSAKeyPair = async (): Promise<CryptoKeyPair> => {
  return await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
};

export const exportPublicKey = async (publicKey: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const exportedAsString = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return exportedAsString
}

export const importPublicKey = async (publicKeyString: string): Promise<CryptoKey> => {
  const binaryString = atob(publicKeyString);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    {
    name: 'RSA-OAEP',
    hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

export const storePrivateKey = async (key: CryptoKey) => {
  const dbRequest = indexedDB.open('secure-messaging-db', 1);

  dbRequest.onupgradeneeded = () => {
    dbRequest.result.createObjectStore('keys', { keyPath: 'id'});
  };

  dbRequest.onsuccess = () => {
    const tx = dbRequest.result.transaction('keys', 'readwrite');
    tx.objectStore('keys').put({ id: 'privateKey', key });
  };
}

export const getPrivateKey = async (): Promise<CryptoKey | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('secure-messaging-db', 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('keys', 'readonly');
      const store = tx.objectStore('keys');
      const getRequest = store.get('privateKey');

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.key ?? null);
      };

      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
};

export const encryptMessage = async (message: string, recipientPublicKey: CryptoKey) => {
  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedMessage = new TextEncoder().encode(message);
  const encryptMessage = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encodedMessage
  );

  const rawAESKey = await crypto.subtle.exportKey('raw', aesKey);
  const encryptedAESKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    recipientPublicKey,
    rawAESKey,
  );

  return {
    encryptedMessage: btoa(String.fromCharCode(... new Uint8Array(encryptMessage))),
    encryptedAESKey: btoa(String.fromCharCode(...new Uint8Array(encryptedAESKey))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export const decryptMessage = async (
  encryptedMessage: string,
  encryptedAESKey: string,
  iv: string,
  privateKey: CryptoKey
): Promise<string> => {
  try {
    const aesKeyBuffer = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      Uint8Array.from(atob(encryptedAESKey), c => c.charCodeAt(0))
    );

    const aesKey = await crypto.subtle.importKey(
      'raw',
      aesKeyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) },
      aesKey,
      Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0))
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption failed:', err);
    return '[Message could not be decrypted]';
  }
};

export const getRecipientPublicKey = async (recipientId: string): Promise<CryptoKey | null> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_keys')
    .select('public_key')
    .eq('user_id', recipientId)
    .single();

  if (error || !data) {
    console.error('Failed to get recipient public key:', error);
    return null;
  }

  try {
    return await importPublicKey(data.public_key);
  } catch (error) {
    console.error('Failed to import recipient public key:', error);
    return null;
  }
};