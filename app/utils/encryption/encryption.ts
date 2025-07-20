export const deriveEncryptionSession = async (accessToken: string, email: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(accessToken + email),
        { name: 'PBKDF2'},
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(email),
            iterations: 10000,
            hash: 'SHA-256'
        }, 
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

export const encryptMessage = async (message: string, key: CryptoKey) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(message);
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );

    return {
        data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

export const decryptMessage = async (encryptedData: string, iv: string, key: CryptoKey) => {
    try {
        const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
        
        const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivArray },
        key,
        data
        );
        
        return new TextDecoder().decode(decrypted);
  } catch (error) {
        console.error('Decryption failed:', error);
        return '[Message could not be decrypted]';
  }
};