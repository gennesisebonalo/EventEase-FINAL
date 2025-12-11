import { Alert, Linking } from 'react-native';

export class DiagnosticTool {
  static async runFullDiagnostic() {
    console.log('🔍 Running EventEase Diagnostic Tool...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Check if we're in development mode
    const isDevelopment = __DEV__;
    results.tests.push({
      name: 'Development Mode',
      status: isDevelopment ? 'PASS' : 'FAIL',
      message: isDevelopment ? 'Running in development mode' : 'Not in development mode'
    });

    // Test 2: Check server configurations
    const serverConfigs = [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'http://192.168.1.17:8000',
      'http://10.0.2.2:8000'
    ];

    console.log('🌐 Testing server connections...');
    for (const server of serverConfigs) {
      try {
        const result = await this.testServerConnection(server);
        results.tests.push({
          name: `Server: ${server}`,
          status: result.success ? 'PASS' : 'FAIL',
          message: result.success ? 'Server is reachable' : `Error: ${result.error}`
        });
      } catch (error) {
        results.tests.push({
          name: `Server: ${server}`,
          status: 'FAIL',
          message: `Connection failed: ${error.message}`
        });
      }
    }

    // Test 3: Check network connectivity
    try {
      const networkTest = await this.testNetworkConnectivity();
      results.tests.push({
        name: 'Network Connectivity',
        status: networkTest.success ? 'PASS' : 'FAIL',
        message: networkTest.message
      });
    } catch (error) {
      results.tests.push({
        name: 'Network Connectivity',
        status: 'FAIL',
        message: `Network test failed: ${error.message}`
      });
    }

    // Generate diagnostic report
    this.generateDiagnosticReport(results);
    return results;
  }

  static async testServerConnection(serverUrl) {
    try {
      console.log(`Testing connection to: ${serverUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const testUrls = [
        `${serverUrl}/api/health`,
        `${serverUrl}/api`,
        `${serverUrl}/`,
      ];

      let lastError = null;
      for (const testUrl of testUrls) {
        try {
          const response = await fetch(testUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          clearTimeout(timeoutId);
          
          console.log(`${testUrl} responded with: ${response.status}`);
          
          if (response.ok) {
            return { success: true, message: `Server responding on ${testUrl}` };
          } else if (response.status === 404) {
            // Server is running but endpoint doesn't exist
            return { 
              success: true, 
              message: `Server running but API endpoints not found (${response.status})` 
            };
          } else {
            lastError = `Server responded with ${response.status}`;
          }
        } catch (error) {
          lastError = error.message;
        }
      }

      clearTimeout(timeoutId);
      return { success: false, error: lastError };
    } catch (error) {
      return { 
        success: false, 
        error: error.name === 'AbortError' ? 'Connection timeout' : error.message 
      };
    }
  }

  static async testNetworkConnectivity() {
    try {
      // Test with a reliable endpoint
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
      });

      return {
        success: response.ok,
        message: response.ok ? 'Internet connection working' : 'Internet connection issues'
      };
    } catch (error) {
      return {
        success: false,
        message: 'No internet connection detected'
      };
    }
  }

  static generateDiagnosticReport(results) {
    console.log('\n📋 EventEase Diagnostic Report');
    console.log('================================');
    console.log(`Timestamp: ${results.timestamp}`);
    console.log('\nTest Results:');
    
    let passCount = 0;
    let failCount = 0;

    results.tests.forEach(test => {
      const statusIcon = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${statusIcon} ${test.name}: ${test.message}`);
      
      if (test.status === 'PASS') {
        passCount++;
      } else {
        failCount++;
      }
    });

    console.log(`\nSummary: ${passCount} passed, ${failCount} failed`);
    
    if (failCount > 0) {
      console.log('\n🔧 Recommended Actions:');
      const failedTests = results.tests.filter(test => test.status === 'FAIL');
      this.showRecommendedActions(failedTests);
    }
  }

  static showRecommendedActions(failedTests) {
    const actions = [];

    failedTests.forEach(test => {
      if (test.name.includes('Server:')) {
        actions.push('🚀 Start your Laravel server: cd EventEase-backend && php artisan serve --host=0.0.0.0 --port=8000');
      }
      
      if (test.name === 'Network Connectivity' && test.message.includes('No internet')) {
        actions.push('📶 Check your internet connection');
      }
      
      if (test.message.includes('API endpoints not found')) {
        actions.push('⚙️ Configure Laravel API routes in routes/api.php');
      }
    });

    if (actions.length > 0) {
      console.log('\nRecommended Actions:');
      actions.forEach(action => console.log(action));
      
      // Show actionable alerts
      this.showDiagnosticAlerts(failedTests);
    }
  }

  static showDiagnosticAlerts(failedTests) {
    const serverTests = failedTests.filter(test => test.name.includes('Server:'));
    
    if (serverTests.length === failedTests.length && failedTests.length > 0) {
      Alert.alert(
        'Server Connection Issues',
        'None of the configured servers are accessible. This usually means:\n\n' +
        '1. Laravel server is not running\n' +
        '2. Wrong IP address or port\n' +
        '3. Firewall blocking connections\n\n' +
        'Would you like to see setup instructions?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Setup Help', 
            onPress: () => this.showSetupInstructions()
          },
          { 
            text: 'Run Again', 
            onPress: () => this.runFullDiagnostic()
          }
        ]
      );
    }
  }

  static showSetupInstructions() {
    Alert.alert(
      'Server Setup Instructions',
      'To fix server connection issues:\n\n' +
      '1. Open Command Prompt/Terminal\n' +
      '2. Navigate to EventEase-backend folder\n' +
      '3. Run: php artisan serve --host=0.0.0.0 --port=8000\n' +
      '4. Verify "Laravel development server started" message\n' +
      '5. Check server shows http://0.0.0.0:8000\n\n' +
      'For detailed instructions, check the troubleshooting guide.',
      [
        { text: 'OK' },
        { 
          text: 'Open Troubleshooting', 
          onPress: () => {
            // In a real app, you might open a help screen
            console.log('Opening troubleshooting guide...');
          }
        }
      ]
    );
  }

  static async quickServerTest() {
    console.log('🚀 Quick server test...');
    
    const servers = [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'http://192.168.1.17:8000'
    ];

    for (const server of servers) {
      const result = await this.testServerConnection(server);
      if (result.success) {
        console.log(`✅ Working server found: ${server}`);
        return { success: true, server, message: 'Server is accessible' };
      }
    }

    console.log('❌ No working servers found');
    return { success: false, message: 'No servers accessible' };
  }

  static getCommonSolutions() {
    return [
      {
        problem: 'All servers failing',
        solutions: [
          'Start Laravel server: php artisan serve --host=0.0.0.0 --port=8000',
          'Check if server is running on correct port',
          'Verify firewall is not blocking connections',
          'Ensure both devices are on same network'
        ]
      },
      {
        problem: 'Server running but API not found',
        solutions: [
          'Check routes/api.php file exists and has login route',
          'Verify Laravel is properly configured',
          'Run: php artisan route:list | grep POST',
          'Ensure CORS is configured properly'
        ]
      },
      {
        problem: 'Connection timeout',
        solutions: [
          'Check network connection',
          'Verify server IP address',
          'Try different port (8001, 8080, 3000)',
          'Restart Laravel server'
        ]
      }
    ];
  }
}

export default DiagnosticTool;

