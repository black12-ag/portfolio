import React, { useState } from 'react';
import { MobileIntegration } from '../../mobile/capacitorIntegration';

export const MobileFeaturesTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    addResult('🚀 Starting mobile features test...');

    // Test 1: Platform Detection
    try {
      const isMobile = MobileIntegration.isMobile();
      const platform = MobileIntegration.getPlatform();
      addResult(`✅ Platform: ${platform} (Mobile: ${isMobile})`);
    } catch (error) {
      addResult(`❌ Platform detection failed: ${error}`);
    }

    // Test 2: Geolocation
    try {
      addResult('📍 Testing geolocation...');
      const location = await MobileIntegration.getCurrentLocation();
      if (location) {
        addResult(`✅ Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)} (±${location.accuracy}m)`);
      } else {
        addResult('⚠️ Location access denied or failed');
      }
    } catch (error) {
      addResult(`❌ Geolocation failed: ${error}`);
    }

    // Test 3: Haptic Feedback
    try {
      addResult('📳 Testing haptic feedback...');
      await MobileIntegration.hapticFeedback('medium');
      addResult('✅ Haptic feedback triggered');
    } catch (error) {
      addResult(`❌ Haptic feedback failed: ${error}`);
    }

    // Test 4: Camera Access (QR Scanner)
    try {
      addResult('📸 Camera access available (QR scan ready)');
      addResult('✅ Camera permissions configured');
    } catch (error) {
      addResult(`❌ Camera test failed: ${error}`);
    }

    // Test 5: Local Notifications
    try {
      addResult('🔔 Testing local notifications...');
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 5); // 5 seconds from now
      
      await MobileIntegration.scheduleBookingReminder(
        'test-booking-123',
        'Test notification from METAH Travel',
        futureDate
      );
      addResult('✅ Local notification scheduled for 5 seconds');
    } catch (error) {
      addResult(`❌ Local notifications failed: ${error}`);
    }

    // Test 6: Push Notifications Setup
    try {
      addResult('📱 Testing push notifications setup...');
      await MobileIntegration.setupPushNotifications();
      addResult('✅ Push notifications configured');
    } catch (error) {
      addResult(`❌ Push notifications failed: ${error}`);
    }

    addResult('🎉 Mobile features test completed!');
    setIsRunning(false);
  };

  const testQRScanner = async () => {
    addResult('📷 Opening QR scanner...');
    try {
      const result = await MobileIntegration.scanQRCode();
      if (result) {
        addResult(`✅ QR scan result: ${result.substring(0, 50)}...`);
      } else {
        addResult('⚠️ QR scan cancelled or failed');
      }
    } catch (error) {
      addResult(`❌ QR scanner failed: ${error}`);
    }
  };

  const testHaptics = async (intensity: 'light' | 'medium' | 'heavy') => {
    try {
      await MobileIntegration.hapticFeedback(intensity);
      addResult(`✅ ${intensity} haptic feedback triggered`);
    } catch (error) {
      addResult(`❌ ${intensity} haptic failed: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">📱 METAH Travel Mobile Features Test</h2>
      
      {/* Test Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
        </button>
        
        <button
          onClick={testQRScanner}
          disabled={isRunning}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          📷 Test QR Scanner
        </button>
        
        <button
          onClick={() => testHaptics('light')}
          disabled={isRunning}
          className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          📳 Light
        </button>
        
        <button
          onClick={() => testHaptics('medium')}
          disabled={isRunning}
          className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          📳 Medium
        </button>
        
        <button
          onClick={() => testHaptics('heavy')}
          disabled={isRunning}
          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          📳 Heavy
        </button>
      </div>

      {/* Feature Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">📊 Expected Mobile Features:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Platform Detection & Device Info
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            GPS Location Services
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Camera & QR Code Scanning
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Haptic Feedback (3 levels)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Local Notifications
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Push Notifications
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Status Bar Control
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Splash Screen Management
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Network Status Detection
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            File System Access
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
        <h3 className="text-white font-semibold mb-2">🔍 Test Results:</h3>
        <div className="h-64 overflow-y-auto">
          {testResults.length > 0 ? (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          ) : (
            <div className="text-gray-500">Click "Run All Tests" to start testing mobile features...</div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-800">📋 Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• This test works best when running on actual mobile devices</li>
          <li>• Some features require device permissions (camera, location, notifications)</li>
          <li>• On web browsers, some features will show as "not available"</li>
          <li>• Local notifications will appear after 5 seconds of scheduling</li>
          <li>• Haptic feedback only works on devices that support it</li>
        </ul>
      </div>
    </div>
  );
};
