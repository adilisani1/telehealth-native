import authApi from '../services/authApi';
import { setUser } from '../redux/Slices/authSlice';

/**
 * Force refresh user profile from backend after login
 * This prevents showing stale user data from previous sessions
 */
export const refreshUserProfile = async (dispatch, token = null) => {
  try {
    console.log('Refreshing user profile...');
    
    // If no token provided, try to get it from storage
    let authToken = token;
    if (!authToken) {
      try {
        const { tokenManager } = await import('./tokenStorage');
        authToken = await tokenManager.getToken();
        if (!authToken) {
          console.log('No token available for profile refresh - skipping');
          return null;
        }
      } catch (tokenError) {
        console.log('Failed to get token for profile refresh:', tokenError);
        return null;
      }
    }
    
    const response = await authApi.getProfile(authToken);
    
    if (response.data && response.data.success && response.data.data) {
      // Update Redux with fresh user data
      dispatch(setUser(response.data.data));
      console.log('User profile refreshed successfully');
      return response.data.data;
    } else {
      console.warn('Profile refresh returned invalid data:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Failed to refresh user profile:', error);
    
    // If profile fetch fails with 401, clear auth state
    if (error.response?.status === 401) {
      console.log('Profile refresh failed with 401 - clearing auth state');
      const { forceAuthReset } = await import('./authUtils');
      const { logoutUser } = await import('../redux/Slices/authSlice');
      
      await forceAuthReset();
      dispatch(logoutUser());
    }
    
    return null;
  }
};

/**
 * Verify current authentication state and refresh if needed
 */
export const verifyAuthState = async (dispatch, currentUser) => {
  try {
    console.log('Verifying auth state for user:', currentUser?._id || currentUser?.id);
    
    // Check if we have a valid token first
    const { tokenManager } = await import('./tokenStorage');
    const hasValidToken = await tokenManager.isTokenValid();
    
    if (!hasValidToken) {
      console.log('No valid token found - auth state invalid');
      return false;
    }
    
    // Try to refresh user profile (but don't fail if it doesn't work)
    const freshUser = await refreshUserProfile(dispatch);
    
    // If we couldn't get fresh user data but we have a valid token and current user, 
    // don't immediately logout - the user might still be valid
    if (!freshUser) {
      console.log('Could not refresh user profile, but token is valid - allowing auth state');
      return true;
    }
    
    // Check if user data has changed (different user logged in)
    const currentUserId = currentUser?._id || currentUser?.id;
    const freshUserId = freshUser._id || freshUser.id;
    
    if (freshUserId && currentUserId && freshUserId !== currentUserId) {
      console.warn('User ID mismatch detected - clearing auth state');
      console.warn(`Current: ${currentUserId}, Fresh: ${freshUserId}`);
      
      const { forceAuthReset } = await import('./authUtils');
      const { logoutUser } = await import('../redux/Slices/authSlice');
      
      await forceAuthReset();
      dispatch(logoutUser());
      return false;
    }
    
    console.log('Auth state verification successful');
    return true;
  } catch (error) {
    console.error('Auth state verification failed:', error);
    
    // Only logout if it's a critical auth error (like 401)
    if (error.response?.status === 401) {
      console.log('Auth verification failed with 401 - logging out');
      const { forceAuthReset } = await import('./authUtils');
      const { logoutUser } = await import('../redux/Slices/authSlice');
      
      await forceAuthReset();
      dispatch(logoutUser());
      return false;
    }
    
    // For other errors, don't immediately logout - just log the error
    console.log('Auth verification had non-critical error - maintaining auth state');
    return true;
  }
};

export default {
  refreshUserProfile,
  verifyAuthState,
};
