/**
 * Authentication System Validator
 * Comprehensive testing utility for the secure token management system
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenManager } from './tokenStorage';
import authApi from '../services/authApi';

export class AuthSystemValidator {
  constructor() {
    this.testResults = [];
    this.errors = [];
  }

  /**
   * Log test result
   */
  logTest(testName, passed, details = '') {
    const result = {
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${details}`);
    
    if (!passed) {
      this.errors.push(result);
    }
  }

  /**
   * Test 1: Token Storage and Retrieval
   */
  async testTokenStorage() {
    try {
      // Clear any existing tokens
      await tokenManager.removeToken();
      
      // Test storing a token
      const testTokenData = {
        token: 'test-jwt-token-12345',
        refreshToken: 'test-refresh-token-67890',
        expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour from now
        tokenType: 'Bearer'
      };
      
      const storeResult = await tokenManager.storeToken(testTokenData);
      this.logTest('Token Storage', storeResult, 'Token stored successfully');
      
      // Test retrieving the token
      const retrievedToken = await tokenManager.getToken();
      const tokensMatch = retrievedToken === testTokenData.token;
      this.logTest('Token Retrieval', tokensMatch, `Retrieved: ${retrievedToken?.substring(0, 20)}...`);
      
      // Test token metadata
      const metadata = await tokenManager.getTokenMetadata();
      const hasMetadata = metadata && metadata.refreshToken === testTokenData.refreshToken;
      this.logTest('Token Metadata', hasMetadata, `Metadata exists: ${!!metadata}`);
      
      // Test auth header format
      const authHeader = await tokenManager.getAuthHeader();
      const correctFormat = authHeader === `Bearer ${testTokenData.token}`;
      this.logTest('Auth Header Format', correctFormat, authHeader);
      
      // Clean up
      await tokenManager.removeToken();
      
    } catch (error) {
      this.logTest('Token Storage Test', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 2: Token Encryption/Decryption
   */
  async testTokenEncryption() {
    try {
      // Store a token and check if it's encrypted in AsyncStorage
      const testToken = 'sensitive-jwt-token-data';
      await tokenManager.storeToken({ token: testToken });
      
      // Check raw AsyncStorage - should be encrypted
      const rawStoredToken = await AsyncStorage.getItem('secure_auth_token');
      const isEncrypted = rawStoredToken !== testToken && rawStoredToken.length > testToken.length;
      this.logTest('Token Encryption', isEncrypted, `Stored token is encrypted: ${isEncrypted}`);
      
      // Verify we can still retrieve the original token
      const retrievedToken = await tokenManager.getToken();
      const decryptionWorks = retrievedToken === testToken;
      this.logTest('Token Decryption', decryptionWorks, `Decryption successful: ${decryptionWorks}`);
      
      await tokenManager.removeToken();
      
    } catch (error) {
      this.logTest('Token Encryption Test', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 3: Memory Cache Performance
   */
  async testMemoryCache() {
    try {
      // Clear cache and store token
      tokenManager.clearMemoryCache();
      await tokenManager.removeToken();
      
      const testToken = 'cache-test-token';
      await tokenManager.storeToken({ token: testToken });
      
      // First call should populate cache
      const start1 = Date.now();
      const token1 = await tokenManager.getToken();
      const time1 = Date.now() - start1;
      
      // Second call should use cache (faster)
      const start2 = Date.now();
      const token2 = await tokenManager.getToken();
      const time2 = Date.now() - start2;
      
      const cacheWorks = token1 === token2 && time2 < time1;
      this.logTest('Memory Cache', cacheWorks, `Cache time: ${time2}ms vs Initial: ${time1}ms`);
      
      // Test cache statistics
      const stats = tokenManager.getCacheStats();
      const hasValidStats = stats.hasMemoryCache && stats.isMemoryCacheValid;
      this.logTest('Cache Statistics', hasValidStats, `Cache valid: ${stats.isMemoryCacheValid}`);
      
      await tokenManager.removeToken();
      
    } catch (error) {
      this.logTest('Memory Cache Test', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 4: Token Expiry Handling
   */
  async testTokenExpiry() {
    try {
      // Store an expired token
      const expiredTokenData = {
        token: 'expired-token',
        expiresAt: Date.now() - 1000 // 1 second ago
      };
      
      await tokenManager.storeToken(expiredTokenData);
      
      // Try to get expired token
      const retrievedToken = await tokenManager.getToken();
      const handlesExpiry = retrievedToken === null;
      this.logTest('Token Expiry Handling', handlesExpiry, `Expired token returned: ${retrievedToken === null ? 'null' : 'token'}`);
      
      // Check if expired token was cleaned up
      const tokenAfterExpiry = await AsyncStorage.getItem('secure_auth_token');
      const cleanedUp = tokenAfterExpiry === null;
      this.logTest('Expired Token Cleanup', cleanedUp, `Token cleaned up: ${cleanedUp}`);
      
    } catch (error) {
      this.logTest('Token Expiry Test', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 5: API Integration
   */
  async testApiIntegration() {
    try {
      // Test if API interceptor is working
      const testToken = 'api-test-token';
      await tokenManager.storeToken({ token: testToken });
      
      // Mock API call to test interceptor
      try {
        // This should fail but with proper token injection
        await authApi.getProfile();
      } catch (error) {
        // Check if the request had proper authorization header
        const hasAuthHeader = error.config?.headers?.Authorization?.includes(testToken);
        this.logTest('API Token Injection', hasAuthHeader, `Token injected in request: ${hasAuthHeader}`);
      }
      
      await tokenManager.removeToken();
      
    } catch (error) {
      this.logTest('API Integration Test', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 6: Complete Auth Flow Simulation
   */
  async testCompleteAuthFlow() {
    try {
      // Simulate complete logout
      await tokenManager.removeToken();
      await AsyncStorage.multiRemove(['persist:root', 'authToken', 'user_data']);
      
      const afterLogout = await tokenManager.getToken();
      const logoutComplete = afterLogout === null;
      this.logTest('Complete Logout', logoutComplete, `Token after logout: ${afterLogout === null ? 'null' : 'exists'}`);
      
      // Simulate login
      const loginTokenData = {
        token: 'login-flow-token',
        refreshToken: 'login-refresh-token',
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      await tokenManager.storeToken(loginTokenData);
      const afterLogin = await tokenManager.getToken();
      const loginWorks = afterLogin === loginTokenData.token;
      this.logTest('Login Flow', loginWorks, `Login token stored: ${loginWorks}`);
      
      // Test token validation
      const isValid = await tokenManager.isTokenValid();
      this.logTest('Token Validation', isValid, `Token is valid: ${isValid}`);
      
    } catch (error) {
      this.logTest('Complete Auth Flow Test', false, `Error: ${error.message}`);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🔍 Starting Authentication System Validation...\n');
    
    await this.testTokenStorage();
    await this.testTokenEncryption();
    await this.testMemoryCache();
    await this.testTokenExpiry();
    await this.testApiIntegration();
    await this.testCompleteAuthFlow();
    
    this.generateReport();
  }

  /**
   * Generate test report
   */
  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n📊 Authentication System Validation Report');
    console.log('==========================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.errors.forEach(error => {
        console.log(`  • ${error.test}: ${error.details}`);
      });
    }
    
    console.log('\n🔒 Security Features Status:');
    console.log(`  • Token Encryption: ${this.testResults.find(t => t.test === 'Token Encryption')?.passed ? '✅' : '❌'}`);
    console.log(`  • Memory Caching: ${this.testResults.find(t => t.test === 'Memory Cache')?.passed ? '✅' : '❌'}`);
    console.log(`  • Expiry Handling: ${this.testResults.find(t => t.test === 'Token Expiry Handling')?.passed ? '✅' : '❌'}`);
    console.log(`  • API Integration: ${this.testResults.find(t => t.test === 'API Token Injection')?.passed ? '✅' : '❌'}`);
    
    const overallHealth = failedTests === 0 ? 'EXCELLENT' : failedTests <= 2 ? 'GOOD' : 'NEEDS ATTENTION';
    console.log(`\n🎯 Overall System Health: ${overallHealth}`);
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: (passedTests / totalTests) * 100,
      overallHealth,
      errors: this.errors
    };
  }
}

// Export convenience function
export const validateAuthSystem = async () => {
  const validator = new AuthSystemValidator();
  return await validator.runAllTests();
};

export default AuthSystemValidator;
