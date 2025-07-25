/**
 * Simple Auth Fix Validator
 * Run this to test if the login/logout issue is resolved
 */

import { tokenManager } from './tokenStorage';
import authApi from '../services/authApi';

export const testAuthFix = async () => {
  console.log('🔧 Testing Auth Fix...');
  console.log('========================');

  try {
    // Test 1: Token Storage Order
    console.log('\n1️⃣ Testing Token Storage...');
    await tokenManager.removeToken();
    
    const testToken = 'test-jwt-12345';
    await tokenManager.storeToken({
      token: testToken,
      expiresAt: Date.now() + 60000 // 1 minute
    });
    
    const retrievedToken = await tokenManager.getToken();
    console.log(`✅ Token stored and retrieved: ${retrievedToken === testToken}`);

    // Test 2: Token Validation
    console.log('\n2️⃣ Testing Token Validation...');
    const isValid = await tokenManager.isTokenValid();
    console.log(`✅ Token is valid: ${isValid}`);

    // Test 3: API Integration Test (will fail but should show proper token injection)
    console.log('\n3️⃣ Testing API Token Injection...');
    try {
      await authApi.getProfile();
    } catch (error) {
      const hasAuthHeader = error.config?.headers?.Authorization?.includes(testToken);
      console.log(`✅ Token injected in API request: ${hasAuthHeader}`);
    }

    // Test 4: Cleanup
    console.log('\n4️⃣ Testing Cleanup...');
    await tokenManager.removeToken();
    const afterCleanup = await tokenManager.getToken();
    console.log(`✅ Token cleaned up: ${afterCleanup === null}`);

    console.log('\n🎉 Auth fix test completed!');
    return true;

  } catch (error) {
    console.error('❌ Auth fix test failed:', error);
    return false;
  }
};

export const debugCurrentAuthState = async () => {
  console.log('🔍 Current Auth State Debug');
  console.log('===========================');

  try {
    // Check token status
    const token = await tokenManager.getToken();
    const isValid = await tokenManager.isTokenValid();
    const metadata = await tokenManager.getTokenMetadata();
    const cacheStats = tokenManager.getCacheStats();

    console.log('Token Status:');
    console.log(`  📱 Has Token: ${!!token}`);
    console.log(`  ✅ Is Valid: ${isValid}`);
    console.log(`  ⏰ Expires: ${metadata?.expiresAt ? new Date(metadata.expiresAt).toLocaleString() : 'N/A'}`);
    console.log(`  🔄 Has Refresh: ${!!metadata?.refreshToken}`);
    console.log(`  💾 Memory Cache: ${cacheStats.hasMemoryCache ? 'Active' : 'Empty'}`);

    return {
      hasToken: !!token,
      isValid,
      expiresAt: metadata?.expiresAt,
      hasRefreshToken: !!metadata?.refreshToken,
      cacheActive: cacheStats.hasMemoryCache
    };

  } catch (error) {
    console.error('❌ Debug failed:', error);
    return null;
  }
};

export default { testAuthFix, debugCurrentAuthState };
