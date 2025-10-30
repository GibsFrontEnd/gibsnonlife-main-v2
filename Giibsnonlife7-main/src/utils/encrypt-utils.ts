//@ts-nocheck
import * as CryptoJS from "crypto-js";

// Safe runtime access to environment variables
const getEnvironmentVariable = (key: string): string | undefined => {
  try {
    // For Vite environment variables (client-side)
    if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
      return import.meta.env[key] as string;
    }
    
    // For Node.js environment (server-side/SSR)
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key];
    }
    
    // Fallback for other environments
    if (typeof window !== 'undefined' && (window as any)[key]) {
      return (window as any)[key];
    }
    
    if (typeof globalThis !== 'undefined' && (globalThis as any)[key]) {
      return (globalThis as any)[key];
    }
    
    return undefined;
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return undefined;
  }
};

// Get secret key with validation
const getSecretKey = (): string => {
  const key = getEnvironmentVariable('VITE_SECRET_KEY');
  
  if (!key) {
    // For development, you can use a default key
    // In production, this should throw an error
    const isDevelopment = getEnvironmentVariable('VITE_NODE_ENV') !== 'production' || 
                         getEnvironmentVariable('NODE_ENV') !== 'production';
    
    if (isDevelopment) {
      console.warn('VITE_SECRET_KEY not found, using development fallback');
      return 'development-secret-key-change-in-production';
    } else {
      throw new Error('VITE_SECRET_KEY environment variable is required in production');
    }
  }
  
  return key;
};

const encryptData = (data: any): string | null => {
  try {
    // Validate input
    if (data === null || data === undefined) {
      console.error("Cannot encrypt null or undefined data");
      return null;
    }

    const secretKey = getSecretKey();
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
};

const decryptData = (encryptedData: any): any => {
  try {
    // Validate input
    if (!encryptedData) {
      console.error("Cannot decrypt null or undefined data");
      return null;
    }

    if (typeof encryptedData !== "string") {
      console.error("Encrypted data must be a string");
      return null;
    }

    const secretKey = getSecretKey();
    
    // Perform decryption
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    
    // Check if decryption produced valid bytes
    if (!bytes || bytes.sigBytes <= 0) {
      console.error("Decryption failed - invalid encrypted data or wrong key");
      return null;
    }

    // Convert to UTF-8 string
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    // Validate that we got a non-empty string
    if (!decryptedString) {
      console.error("Decryption produced empty result");
      return null;
    }

    // Parse JSON
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

export { encryptData, decryptData };