import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Server configuration management
export class ServerConfig {
  static STORAGE_KEY = 'server_config';
  
  // Default server configurations
  static DEFAULT_CONFIGS = [
    {
      name: 'Local Development',
      url: 'http://localhost:8000',
      description: 'Local Laravel server (php artisan serve)'
    },
    {
      name: 'Android Emulator',
      url: 'http://10.0.2.2:8000',
      description: 'Android emulator localhost mapping'
    },
    {
      name: 'iOS Simulator',
      url: 'http://127.0.0.1:8000',
      description: 'iOS simulator localhost'
    },
    {
      name: 'Custom Server',
      url: 'http://192.168.1.17:8000',
      description: 'Custom IP address (update as needed)'
    }
  ];

  // Get current server configuration
  static async getCurrentConfig() {
    try {
      const config = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (config) {
        return JSON.parse(config);
      }
      return this.DEFAULT_CONFIGS[0]; // Return first default config
    } catch (error) {
      console.error('Error getting server config:', error);
      return this.DEFAULT_CONFIGS[0];
    }
  }

  // Set server configuration
  static async setConfig(config) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      console.log('Server config saved:', config);
      return true;
    } catch (error) {
      console.error('Error saving server config:', error);
      return false;
    }
  }

  // Test server connectivity
  static async testConnection(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return { success: true, status: response.status };
      } else {
        return { success: false, status: response.status, error: 'Server responded with error' };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Connection timeout' };
      }
      return { success: false, error: error.message };
    }
  }

  // Auto-detect working server
  static async autoDetectServer() {
    console.log('Auto-detecting server...');
    
    for (const config of this.DEFAULT_CONFIGS) {
      console.log(`Testing ${config.name}: ${config.url}`);
      const result = await this.testConnection(config.url);
      
      if (result.success) {
        console.log(`Found working server: ${config.name}`);
        await this.setConfig(config);
        return { success: true, config, message: `Connected to ${config.name}` };
      }
    }
    
    return { 
      success: false, 
      message: 'No working server found. Please check your server configuration.' 
    };
  }

  // Get server status with detailed information
  static async getServerStatus() {
    const config = await this.getCurrentConfig();
    const result = await this.testConnection(config.url);
    
    return {
      config,
      isConnected: result.success,
      status: result.success ? 'connected' : 'disconnected',
      error: result.error || null,
      lastChecked: new Date().toISOString()
    };
  }

  // Show server configuration dialog
  static showConfigDialog(currentConfig, onConfigChange) {
    const configs = this.DEFAULT_CONFIGS;
    
    const buttons = configs.map(config => ({
      text: `${config.name} (${config.url})`,
      onPress: () => {
        this.setConfig(config).then(() => {
          onConfigChange(config);
          Alert.alert('Success', `Server configuration updated to ${config.name}`);
        });
      }
    }));

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Server Configuration',
      `Current: ${currentConfig.name}\n${currentConfig.url}\n\nSelect a server configuration:`,
      buttons
    );
  }

  // Validate server URL format
  static validateServerURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  // Get network information for debugging
  static async getNetworkInfo() {
    try {
      // This would typically use @react-native-netinfo/netinfo
      // For now, return basic info
      return {
        isConnected: true, // This should be checked with NetInfo
        connectionType: 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }

  // Clear server configuration
  static async clearConfig() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('Server config cleared');
      return true;
    } catch (error) {
      console.error('Error clearing server config:', error);
      return false;
    }
  }

  // Get all available configurations
  static getAvailableConfigs() {
    return this.DEFAULT_CONFIGS;
  }

  // Add custom server configuration
  static async addCustomConfig(name, url, description = '') {
    if (!this.validateServerURL(url)) {
      throw new Error('Invalid server URL format');
    }

    const customConfig = {
      name,
      url,
      description: description || `Custom server: ${url}`
    };

    // Test the connection before saving
    const result = await this.testConnection(url);
    if (!result.success) {
      throw new Error(`Cannot connect to server: ${result.error}`);
    }

    await this.setConfig(customConfig);
    return customConfig;
  }
}

export default ServerConfig;
