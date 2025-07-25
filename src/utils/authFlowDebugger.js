/**
 * Authentication Flow Debugger
 * Use this to manually test and debug authentication issues
 */

import { validateAuthSystem } from './authSystemValidator';
import { tokenManager } from './tokenStorage';
import { debugAuthState, emergencyAuthClean } from './authDebug';
import { forceAuthReset } from './authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthFlowDebugger {
  /**
   * Quick health check of the auth system
   */
  static async quickHealthCheck() {
    console.log('🔍 Quick Auth System Health Check');
    console.log('================================');

    try {
      // Check if tokenManager is working
      const hasToken = await tokenManager.getToken();
      console.log(`📱 Current Token: ${hasToken ? 'EXISTS' : 'NONE'}`);

      // Check token metadata
      const metadata = await tokenManager.getTokenMetadata();
      if (metadata) {
        const isExpired = metadata.expiresAt <= Date.now();
        console.log(`⏱️  Token Expires: ${new Date(metadata.expiresAt).toLocaleString()}`);
        console.log(`⚠️  Is Expired: ${isExpired ? 'YES' : 'NO'}`);
        console.log(`🔄 Has Refresh Token: ${metadata.refreshToken ? 'YES' : 'NO'}`);
      }

      // Check AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => 
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('persist') ||
        key.includes('user')
      );
      console.log(`🗂️  Auth-related Storage Keys: ${authKeys.length}`);
      authKeys.forEach(key => console.log(`   - ${key}`));

      // Check cache stats
      const cacheStats = tokenManager.getCacheStats();
      console.log(`💾 Memory Cache: ${cacheStats.hasMemoryCache ? 'ACTIVE' : 'EMPTY'}`);
      console.log(`⚡ Cache Valid: ${cacheStats.isMemoryCacheValid ? 'YES' : 'NO'}`);

      console.log('✅ Health check complete\n');

    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Simulate a complete login flow
   */
  static async simulateLogin() {
    console.log('🔐 Simulating Login Flow');
    console.log('========================');

    try {
      // 1. Clear existing auth data
      console.log('1️⃣ Clearing existing auth data...');
      await forceAuthReset();

      // 2. Simulate receiving login response
      console.log('2️⃣ Simulating login response...');
      const mockLoginData = {
        token: `mock-jwt-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        tokenType: 'Bearer'
      };

      // 3. Store token using secure manager
      console.log('3️⃣ Storing token securely...');
      const storeResult = await tokenManager.storeToken(mockLoginData);
      console.log(`   Store Result: ${storeResult ? 'SUCCESS' : 'FAILED'}`);

      // 4. Verify token retrieval
      console.log('4️⃣ Verifying token retrieval...');
      const retrievedToken = await tokenManager.getToken();
      console.log(`   Retrieved Token: ${retrievedToken ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   Tokens Match: ${retrievedToken === mockLoginData.token ? 'YES' : 'NO'}`);

      // 5. Test auth header
      console.log('5️⃣ Testing auth header format...');
      const authHeader = await tokenManager.getAuthHeader();
      console.log(`   Auth Header: ${authHeader}`);

      console.log('✅ Login simulation complete\n');

    } catch (error) {
      console.error('❌ Login simulation failed:', error);
    }
  }

  /**
   * Simulate a complete logout flow
   */
  static async simulateLogout() {
    console.log('🚪 Simulating Logout Flow');
    console.log('=========================');

    try {
      // 1. Check current state
      console.log('1️⃣ Checking current auth state...');
      const beforeToken = await tokenManager.getToken();
      console.log(`   Token Before Logout: ${beforeToken ? 'EXISTS' : 'NONE'}`);

      // 2. Perform complete logout
      console.log('2️⃣ Performing complete logout...');
      await forceAuthReset();

      // 3. Verify cleanup
      console.log('3️⃣ Verifying cleanup...');
      const afterToken = await tokenManager.getToken();
      console.log(`   Token After Logout: ${afterToken ? 'EXISTS' : 'NONE'}`);

      const keys = await AsyncStorage.getAllKeys();
      const remainingAuthKeys = keys.filter(key => 
        key.includes('auth') || key.includes('token') || key.includes('persist')
      );
      console.log(`   Remaining Auth Keys: ${remainingAuthKeys.length}`);

      console.log('✅ Logout simulation complete\n');

    } catch (error) {
      console.error('❌ Logout simulation failed:', error);
    }
  }

  /**
   * Test token refresh mechanism
   */
  static async testTokenRefresh() {
    console.log('🔄 Testing Token Refresh');
    console.log('========================');

    try {
      // 1. Store a token with refresh capability
      console.log('1️⃣ Storing token with refresh capability...');
      const tokenData = {
        token: 'test-token-for-refresh',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 1000, // Expires in 1 second
        tokenType: 'Bearer'
      };

      await tokenManager.storeToken(tokenData);

      // 2. Wait for token to expire
      console.log('2️⃣ Waiting for token to expire...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Try to get token (should trigger refresh attempt)
      console.log('3️⃣ Attempting to get expired token...');
      const refreshedToken = await tokenManager.getToken();
      console.log(`   Refresh Result: ${refreshedToken ? 'TOKEN RETURNED' : 'NO TOKEN (refresh failed)'}`);

      console.log('✅ Token refresh test complete\n');

    } catch (error) {
      console.error('❌ Token refresh test failed:', error);
    }
  }

  /**
   * Run comprehensive authentication tests
   */
  static async runComprehensiveTest() {
    console.log('🧪 Running Comprehensive Auth Tests');
    console.log('===================================\n');

    await this.quickHealthCheck();
    await this.simulateLogin();
    await this.simulateLogout();
    await this.testTokenRefresh();

    // Run full validation suite
    console.log('🔬 Running Full Validation Suite...');
    await validateAuthSystem();
  }

  /**
   * Emergency auth system reset (nuclear option)
   */
  static async emergencyReset() {
    console.log('🚨 EMERGENCY AUTH SYSTEM RESET');
    console.log('==============================');
    console.log('⚠️  This will clear ALL authentication data!');

    try {
      // Clear token manager
      await tokenManager.removeToken();
      tokenManager.clearMemoryCache();

      // Clear AsyncStorage completely
      await AsyncStorage.clear();

      // Force auth reset
      await forceAuthReset();

      console.log('✅ Emergency reset complete');
      console.log('ℹ️  All auth data has been cleared');
      console.log('ℹ️  App restart recommended');

    } catch (error) {
      console.error('❌ Emergency reset failed:', error);
    }
  }
}

// Export convenience functions
export const debugAuth = AuthFlowDebugger.quickHealthCheck;
export const testLogin = AuthFlowDebugger.simulateLogin;
export const testLogout = AuthFlowDebugger.simulateLogout;
export const testRefresh = AuthFlowDebugger.testTokenRefresh;
export const runFullTest = AuthFlowDebugger.runComprehensiveTest;
export const emergencyReset = AuthFlowDebugger.emergencyReset;

export default AuthFlowDebugger;
