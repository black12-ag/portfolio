import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import MobileApp from './MobileApp'
import './index.css'

console.log('🔄 Starting mobile app initialization...')
console.log('📱 Platform:', Capacitor.getPlatform())
console.log('🔧 Is Native Platform:', Capacitor.isNativePlatform())

// Initialize mobile app
try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }

  console.log('✅ Root element found, creating React app...')
  
  createRoot(root).render(<MobileApp />);
  
  console.log('🎉 Mobile app initialized successfully!')
} catch (error) {
  console.error('❌ Mobile app initialization failed:', error)
  
  // Fallback UI
  document.getElementById("root").innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="font-size: 24px; margin-bottom: 16px;">Metah Travel</h1>
      <p style="font-size: 16px; margin-bottom: 20px;">Mobile app is starting...</p>
      <div style="
        width: 40px; 
        height: 40px; 
        border: 4px solid rgba(255,255,255,0.3); 
        border-top: 4px solid white; 
        border-radius: 50%; 
        animation: spin 1s linear infinite;
      "></div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
        Platform: ${Capacitor.getPlatform()}<br>
        Error: ${error.message}
      </p>
    </div>
  `;
}
