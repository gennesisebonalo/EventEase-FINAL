import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DiagnosticTool from '../utils/DiagnosticTool';

export const ServerStatus = ({ onConnectionChange }) => {
  const [status, setStatus] = useState('unknown'); // unknown, connected, disconnected
  const [isLoading, setIsLoading] = useState(false);
  const [currentServer, setCurrentServer] = useState('');
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await DiagnosticTool.quickServerTest();
      
      if (result.success) {
        setStatus('connected');
        setCurrentServer(result.server);
        onConnectionChange?.(true);
      } else {
        setStatus('disconnected');
        setCurrentServer('');
        onConnectionChange?.(false);
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Connection test error:', error);
      setStatus('disconnected');
      setCurrentServer('');
      onConnectionChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullDiagnostic = async () => {
    setIsLoading(true);
    try {
      await DiagnosticTool.runFullDiagnostic();
    } catch (error) {
      console.error('Diagnostic error:', error);
      Alert.alert('Diagnostic Error', 'Failed to run diagnostic tool');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: '#4CAF50',
          backgroundColor: '#E8F5E8',
          icon: 'checkmark-circle',
          text: 'Connected',
          subText: currentServer
        };
      case 'disconnected':
        return {
          color: '#F44336',
          backgroundColor: '#FFE8E8',
          icon: 'close-circle',
          text: 'Disconnected',
          subText: 'Server not reachable'
        };
      default:
        return {
          color: '#FF9800',
          backgroundColor: '#FFF3CD',
          icon: 'warning',
          text: 'Unknown',
          subText: 'Status checking...'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={{
      backgroundColor: config.backgroundColor,
      borderRadius: 12,
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: config.color,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: config.color,
            marginRight: 8
          }} />
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: config.color
            }}>
              {isLoading ? 'Testing...' : config.text}
            </Text>
            
            <Text style={{
              fontSize: 12,
              color: '#666',
              marginTop: 2
            }}>
              {config.subText}
            </Text>
            
            {lastChecked && (
              <Text style={{
                fontSize: 10,
                color: '#999',
                marginTop: 2
              }}>
                Last checked: {lastChecked.toLocaleTimeString()}
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isLoading && (
            <ActivityIndicator size="small" color={config.color} style={{ marginRight: 12 }} />
          )}
          
          <TouchableOpacity
            onPress={testConnection}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.7)',
              marginRight: 8
            }}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={16} color={config.color} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={runFullDiagnostic}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.7)'
            }}
            disabled={isLoading}
          >
            <Ionicons name="search" size={16} color={config.color} />
          </TouchableOpacity>
        </View>
      </View>

      {status === 'disconnected' && (
        <View style={{
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: 'rgba(244,67,54,0.2)'
        }}>
          <Text style={{
            fontSize: 12,
            color: '#F44336',
            fontWeight: '500'
          }}>
            Server Troubleshooting:
          </Text>
          
          <Text style={{
            fontSize: 11,
            color: '#666',
            marginTop: 4
          }}>
            • Start Laravel server: php artisan serve --host=0.0.0.0 --port=8000
          </Text>
          
          <Text style={{
            fontSize: 11,
            color: '#666'
          }}>
            • Check firewall and network settings
          </Text>
          
          <Text style={{
            fontSize: 11,
            color: '#666'
          }}>
            • Verify server IP address in constants/axios.js
          </Text>
        </View>
      )}
    </View>
  );
};

export default ServerStatus;

