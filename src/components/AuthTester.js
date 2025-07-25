import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AuthFlowDebugger from '../utils/authFlowDebugger';
import { validateAuthSystem } from '../utils/authSystemValidator';


const AuthTester = () => {
  const [testResults, setTestResults] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testFunction, testName) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTestResults(`Running ${testName}...\n`);

    try {
      // Capture console output
      const originalLog = console.log;
      let output = '';
      
      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog(...args);
      };

      await testFunction();

      // Restore console.log
      console.log = originalLog;
      
      setTestResults(output || `${testName} completed successfully!`);
    } catch (error) {
      setTestResults(`${testName} failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const tests = [
    {
      name: 'Quick Health Check',
      function: AuthFlowDebugger.quickHealthCheck,
      description: 'Check current auth system status'
    },
    {
      name: 'Simulate Login',
      function: AuthFlowDebugger.simulateLogin,
      description: 'Test complete login flow'
    },
    {
      name: 'Simulate Logout',
      function: AuthFlowDebugger.simulateLogout,
      description: 'Test complete logout flow'
    },
    {
      name: 'Test Token Refresh',
      function: AuthFlowDebugger.testTokenRefresh,
      description: 'Test automatic token refresh'
    },
    {
      name: 'Full Validation Suite',
      function: validateAuthSystem,
      description: 'Run comprehensive auth tests'
    },
    {
      name: 'Emergency Reset',
      function: AuthFlowDebugger.emergencyReset,
      description: '⚠️ Clear ALL auth data (nuclear option)'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔐 Authentication System Tester</Text>
      <Text style={styles.subtitle}>Use these buttons to test the auth system</Text>

      <View style={styles.buttonContainer}>
        {tests.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.testButton,
              test.name === 'Emergency Reset' && styles.dangerButton,
              isRunning && styles.disabledButton
            ]}
            onPress={() => runTest(test.function, test.name)}
            disabled={isRunning}
          >
            <Text style={[
              styles.buttonText,
              test.name === 'Emergency Reset' && styles.dangerButtonText
            ]}>
              {test.name}
            </Text>
            <Text style={styles.buttonDescription}>{test.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {testResults ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          <ScrollView style={styles.resultsScroll}>
            <Text style={styles.resultsText}>{testResults}</Text>
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ How to Use:</Text>
        <Text style={styles.infoText}>
          1. Run "Quick Health Check" first to see current status{'\n'}
          2. Test login/logout flows to verify they work{'\n'}
          3. Run "Full Validation Suite" for comprehensive testing{'\n'}
          4. Use "Emergency Reset" only if auth system is corrupted{'\n'}
          5. Check console logs for detailed output
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dangerButtonText: {
    color: 'white',
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  resultsScroll: {
    maxHeight: 300,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#34495e',
    lineHeight: 16,
  },
  infoContainer: {
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default AuthTester;
