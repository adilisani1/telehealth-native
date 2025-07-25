import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'react-native-crypto-js';

// Encryption key - in production, this should come from secure keychain
const ENCRYPTION_KEY = 'your-app-secret-key-2024'; // Replace with secure key
const TOKEN_KEY = 'secure_auth_token';
const TOKEN_METADATA_KEY = 'token_metadata';

/**
 * Enhanced Token Storage with Security and Auto-Refresh
 * Combines AsyncStorage (persistent) with in-memory cache (fast access)
 */
class SecureTokenManager {
  constructor() {
    this.memoryCache = {
      token: null,
      metadata: null,
      cacheTime: null
    };
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes memory cache
  }

  /**
   * Encrypt sensitive data before storage
   */
  encrypt(data) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  /**
   * Decrypt data from storage
   */
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Store token with metadata (expiry, refresh token, etc.)
   */
  async storeToken(tokenData) {
    try {
      const now = Date.now();
      const metadata = {
        storedAt: now,
        expiresAt: tokenData.expiresAt || (now + (7 * 24 * 60 * 60 * 1000)), // 7 days default
        refreshToken: tokenData.refreshToken || null,
        tokenType: tokenData.tokenType || 'Bearer',
        lastRefresh: now
      };

      // Encrypt token and metadata
      const encryptedToken = this.encrypt(tokenData.token);
      const encryptedMetadata = this.encrypt(metadata);

      if (!encryptedToken || !encryptedMetadata) {
        throw new Error('Token encryption failed');
      }

      // Store in AsyncStorage (persistent)
      await AsyncStorage.multiSet([
        [TOKEN_KEY, encryptedToken],
        [TOKEN_METADATA_KEY, encryptedMetadata]
      ]);

      // Update memory cache
      this.memoryCache = {
        token: tokenData.token,
        metadata,
        cacheTime: now
      };

      console.log('Token stored securely with encryption');
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  }

  /**
   * Get token with smart caching and validation
   */
  async getToken(forceRefresh = false) {
    try {
      const now = Date.now();

      // Check memory cache first (fastest)
      if (!forceRefresh && this.memoryCache.token && this.memoryCache.cacheTime) {
        const cacheAge = now - this.memoryCache.cacheTime;
        if (cacheAge < this.CACHE_DURATION) {
          // Check if token is still valid
          if (this.memoryCache.metadata.expiresAt > now) {
            return this.memoryCache.token;
          }
        }
      }

      // Fallback to AsyncStorage
      const [encryptedToken, encryptedMetadata] = await AsyncStorage.multiGet([
        TOKEN_KEY,
        TOKEN_METADATA_KEY
      ]);

      if (!encryptedToken[1] || !encryptedMetadata[1]) {
        return null;
      }

      // Decrypt data
      const token = this.decrypt(encryptedToken[1]);
      const metadata = this.decrypt(encryptedMetadata[1]);

      if (!token || !metadata) {
        console.warn('Token decryption failed');
        await this.removeToken(); // Clean up corrupted data
        return null;
      }

      // Check if token is expired
      if (metadata.expiresAt <= now) {
        console.log('Token expired, attempting refresh...');
        const refreshed = await this.refreshTokenIfNeeded(metadata.refreshToken);
        if (refreshed) {
          return await this.getToken(true); // Recursive call with fresh token
        }
        return null;
      }

      // Update memory cache
      this.memoryCache = {
        token,
        metadata,
        cacheTime: now
      };

      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Auto-refresh token if refresh token is available
   */
  async refreshTokenIfNeeded(refreshToken) {
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    try {
      // Import auth API dynamically to avoid circular dependency
      const authApi = await import('../services/authApi');
      
      const response = await authApi.default.refreshToken(refreshToken);
      
      if (response.data && response.data.success) {
        const newTokenData = {
          token: response.data.token,
          refreshToken: response.data.refreshToken || refreshToken,
          expiresAt: Date.now() + (response.data.expiresIn * 1000) // Convert to milliseconds
        };
        
        await this.storeToken(newTokenData);
        console.log('Token refreshed successfully');
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.removeToken(); // Clean up invalid tokens
    }
    
    return false;
  }

  /**
   * Remove token and clear all caches
   */
  async removeToken() {
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_METADATA_KEY]);
      
      // Clear memory cache
      this.memoryCache = {
        token: null,
        metadata: null,
        cacheTime: null
      };

      console.log('Token removed from all storage');
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  }

  /**
   * Get token metadata (expiry, type, etc.)
   */
  async getTokenMetadata() {
    try {
      if (this.memoryCache.metadata) {
        return this.memoryCache.metadata;
      }

      const encryptedMetadata = await AsyncStorage.getItem(TOKEN_METADATA_KEY);
      if (!encryptedMetadata) return null;

      return this.decrypt(encryptedMetadata);
    } catch (error) {
      console.error('Error getting token metadata:', error);
      return null;
    }
  }

  /**
   * Check if token is valid and not expired
   */
  async isTokenValid() {
    try {
      const metadata = await this.getTokenMetadata();
      if (!metadata) return false;

      const now = Date.now();
      return metadata.expiresAt > now;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Get token with authorization header format
   */
  async getAuthHeader() {
    const token = await this.getToken();
    if (!token) return null;

    const metadata = await this.getTokenMetadata();
    const tokenType = metadata?.tokenType || 'Bearer';
    
    return `${tokenType} ${token}`;
  }

  /**
   * Clear memory cache (useful for testing or memory management)
   */
  clearMemoryCache() {
    this.memoryCache = {
      token: null,
      metadata: null,
      cacheTime: null
    };
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    const now = Date.now();
    return {
      hasMemoryCache: !!this.memoryCache.token,
      cacheAge: this.memoryCache.cacheTime ? now - this.memoryCache.cacheTime : 0,
      isMemoryCacheValid: this.memoryCache.cacheTime && (now - this.memoryCache.cacheTime) < this.CACHE_DURATION,
      metadata: this.memoryCache.metadata
    };
  }
}

// Create singleton instance
const tokenManager = new SecureTokenManager();

// Legacy compatibility functions
const storeToken = async (token) => {
  return await tokenManager.storeToken({ token });
};

const getToken = async () => {
  return await tokenManager.getToken();
};

const removeToken = async () => {
  return await tokenManager.removeToken();
};

export { 
  storeToken, 
  getToken, 
  removeToken, 
  tokenManager, // Export the full manager for advanced usage
  SecureTokenManager // Export class for testing or custom instances
};
