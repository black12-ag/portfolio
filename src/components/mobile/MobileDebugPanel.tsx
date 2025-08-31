import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const MobileDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState({
    isNative: false,
    platform: 'unknown',
    userAgent: '',
    errors: [] as string[],
    timestamp: new Date().toISOString(),
    whiteScreenDetected: false,
    reactMounted: false,
    domReady: false
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Collect debug information
    const collectDebugInfo = () => {
      try {
        const info = {
          isNative: Capacitor.isNativePlatform(),
          platform: Capacitor.getPlatform(),
          userAgent: navigator.userAgent,
          errors: [],
          timestamp: new Date().toISOString(),
          windowSize: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          location: window.location.href,
          whiteScreenDetected: false,
          reactMounted: true,
          domReady: document.readyState === 'complete'
        };
        
        setDebugInfo(info);
        
        // Log to console for debugging
        console.log('🐛 Mobile Debug Info:', info);
        
        // Check for white screen after a delay
        setTimeout(() => {
          const root = document.getElementById('root');
          if (root && root.children.length === 0) {
            console.error('🚨 WHITE SCREEN DETECTED: Root element is empty');
            setDebugInfo(prev => ({
              ...prev,
              whiteScreenDetected: true,
              errors: [...prev.errors, 'WHITE SCREEN: Root element is empty']
            }));
            setIsExpanded(true); // Auto-expand on white screen
          }
        }, 3000);
        
      } catch (error) {
        console.error('Debug info collection failed:', error);
        setDebugInfo(prev => ({
          ...prev,
          errors: [...prev.errors, error.message]
        }));
      }
    };

    collectDebugInfo();
    
    // Add global error listener
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, event.message || 'Unknown error']
      }));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `Promise rejection: ${event.reason}`]
      }));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Show on native platforms, when white screen is detected, or when explicitly enabled
  const shouldShow = Capacitor.isNativePlatform() || 
                    debugInfo.whiteScreenDetected || 
                    import.meta.env.VITE_SHOW_MOBILE_DEBUG === 'true' ||
                    localStorage.getItem('showMobileDebug') === '1';
                    
  if (!shouldShow) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: debugInfo.whiteScreenDetected ? 'rgba(255,0,0,0.9)' : 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 99999,
        maxWidth: isExpanded ? '90vw' : '300px',
        maxHeight: isExpanded ? '80vh' : '200px',
        overflow: 'auto',
        fontFamily: 'monospace',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: debugInfo.whiteScreenDetected ? '2px solid #fff' : 'none'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <span>📱 Mobile Debug {debugInfo.whiteScreenDetected ? '🚨' : ''}</span>
        <span style={{ fontSize: '10px' }}>{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      {debugInfo.whiteScreenDetected && (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          padding: '5px', 
          marginBottom: '10px',
          borderRadius: '3px',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          🚨 WHITE SCREEN DETECTED
        </div>
      )}
      
      <div>Platform: {debugInfo.platform}</div>
      <div>Native: {debugInfo.isNative ? 'Yes' : 'No'}</div>
      <div>Size: {window.innerWidth}x{window.innerHeight}</div>
      <div>React: {debugInfo.reactMounted ? '✅' : '❌'}</div>
      <div>DOM: {debugInfo.domReady ? '✅' : '❌'}</div>
      
      {isExpanded && (
        <>
          <div style={{ marginTop: '10px', fontSize: '11px' }}>
            <div>Time: {debugInfo.timestamp.split('T')[1]?.split('.')[0]}</div>
            <div>URL: {window.location.pathname}</div>
            <div>UA: {navigator.userAgent.substring(0, 50)}...</div>
          </div>
          
          {debugInfo.errors.length > 0 && (
            <div style={{ color: 'yellow', marginTop: '10px' }}>
              <div style={{ fontWeight: 'bold' }}>Errors ({debugInfo.errors.length}):</div>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto', 
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: '5px',
                marginTop: '5px',
                borderRadius: '3px'
              }}>
                {debugInfo.errors.map((error, i) => (
                  <div key={i} style={{ fontSize: '10px', marginBottom: '3px' }}>
                    {i + 1}. {error}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ 
            marginTop: '15px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.reload();
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Reload
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                const data = JSON.stringify({
                  ...debugInfo,
                  url: window.location.href,
                  userAgent: navigator.userAgent
                }, null, 2);
                
                if (navigator.share && debugInfo.isNative) {
                  navigator.share({
                    title: 'Mobile Debug Info',
                    text: data
                  }).catch(() => {
                    // Fallback to console
                    console.log('Debug Info:', data);
                    alert('Debug info logged to console');
                  });
                } else {
                  console.log('Debug Info:', data);
                  alert('Debug info logged to console');
                }
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#34C759',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Export
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileDebugPanel;
