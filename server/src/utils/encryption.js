const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Create a 32-byte key from the environment key or a secure default
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || 'super_secure_default_agency_key_123!')
  .digest();

/**
 * Encrypt a plain text string using AES-256-CBC
 * @param {string} text Plain text to encrypt
 * @returns {string} Encrypted string in the format iv:ciphertext
 */
exports.encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt a ciphertext string back to plain text
 * @param {string} encryptedText Encrypted string in the format iv:ciphertext
 * @returns {string|null} Decrypted plain text or null if failed
 */
exports.decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedTextVal = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedTextVal, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('💥 Decryption Error:', error.message);
    return null;
  }
};
