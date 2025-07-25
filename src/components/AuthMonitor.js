/**
 * Authentication Flow Monitor
 * Add this component temporarily to monitor auth state changes
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { tokenManager } from '../utils/tokenStorage';

const AuthMonitor = () => {
  const { userId, userType, User } = useSelector(state => state.auth);
  const [tokenStatus, setTokenStatus] = useState('checking...');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ time: timestamp, message }, ...prev.slice(0, 9)]);
    console.log(`[AuthMonitor] ${message}`);
  };

  useEffect(() => {
    addLog(`Redux state changed - userId: ${userId}, userType: ${userType}, hasUser: ${!!User}`);
  }, [userId, userType, User]);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await tokenManager.getToken();
        const isValid = await tokenManager.isTokenValid();
        const metadata = await tokenManager.getTokenMetadata();
        
        const status = `Token: ${token ? 'EXISTS' : 'NONE'}, Valid: ${isValid ? 'YES' : 'NO'}, Expires: ${metadata?.expiresAt ? new Date(metadata.expiresAt).toLocaleTimeString() : 'N/A'}`;
        setTokenStatus(status);
        addLog(`Token status: ${status}`);
      } catch (error) {
        const errorStatus = `Token check failed: ${error.message}`;
        setTokenStatus(errorStatus);
        addLog(errorStatus);
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [userId]);

  // Don't render anything in production
  if (__DEV__ !== true) return null;

  return null; // This is a monitoring component, no UI needed
};

export default AuthMonitor;
