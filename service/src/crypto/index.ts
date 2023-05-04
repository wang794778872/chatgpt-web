import * as crypto from 'crypto'

const CryptoSecret = 'zlwl20230419zlwl'

export function deCrypto(data: string) {
    // console.log('Data:', data);
    const cipher = crypto.createDecipheriv('aes-128-ecb', CryptoSecret, null);
    let decryptedData = cipher.update(data, 'base64', 'utf8');
    decryptedData += cipher.final('utf8');
    // console.log('Decrypted Data:', decryptedData);
    if (decryptedData)
        return decryptedData

    return null
}
