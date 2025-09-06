// Quick test button injection - Run this in browser console
export const addAnimationTestButton = () => {
  // Remove existing button if present
  const existing = document.getElementById('animation-test-btn');
  if (existing) existing.remove();

  // Create the test button
  const button = document.createElement('button');
  button.id = 'animation-test-btn';
  button.innerHTML = '🎨 Test Animations';
  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
    background: linear-gradient(135deg, #3B82F6, #8B5CF6, #06D6A0);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    animation: float 2s ease-in-out infinite;
  `;

  // Add floating animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    #animation-test-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
    }
  `;
  document.head.appendChild(style);

  // Add click handler
  button.onclick = () => {
    window.location.href = '/animation-demo';
  };

  // Append to body
  document.body.appendChild(button);

  console.log('🎨 Animation test button added! Click it to see the animated portfolio.');
};

// Auto-add if not in production
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  setTimeout(addAnimationTestButton, 2000);
}
