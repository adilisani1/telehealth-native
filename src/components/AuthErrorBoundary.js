import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { emergencyAuthClean } from '../utils/authDebug';

class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's an auth-related error
    const errorString = error.toString().toLowerCase();
    const isAuthError = errorString.includes('auth') || 
                       errorString.includes('token') || 
                       errorString.includes('user') ||
                       errorString.includes('login') ||
                       errorString.includes('permission');
    
    if (isAuthError) {
      console.log('Auth-related error detected, preparing emergency cleanup');
    }
  }

  handleEmergencyReset = async () => {
    try {
      await emergencyAuthClean();
      // Reset the error boundary state
      this.setState({ hasError: false, error: null });
      
      // Force app restart/reload
      if (this.props.onReset) {
        this.props.onReset();
      }
    } catch (error) {
      console.error('Emergency reset failed:', error);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Authentication Error</Text>
          <Text style={styles.message}>
            An authentication error occurred. This might be due to corrupted user data or token issues.
          </Text>
          <Text style={styles.errorText}>
            {this.state.error?.toString()}
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={this.handleEmergencyReset}
          >
            <Text style={styles.buttonText}>Reset Authentication</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthErrorBoundary;
