// Test script to verify dashboard navigation after page refresh
// This script should be run in the browser console

(async function testDashboardNavigation() {
  console.log('=== TESTING DASHBOARD NAVIGATION ===');
  
  // Check if localStorage has user data
  const storedUser = localStorage.getItem('tvet_user');
  console.log('Stored user data:', storedUser ? JSON.parse(storedUser) : 'None');
  
  // Check if sessionStorage has any auth data
  const sessionAuth = sessionStorage.getItem('tvet_auth') || sessionStorage.getItem('auth');
  console.log('Session auth data:', sessionAuth);
  
  // Wait for React app to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check if authentication context is loaded
  try {
    const authContext = window.React?.context?.AuthContext;
    console.log('Auth context available:', !!authContext);
  } catch (e) {
    console.log('Could not access React context directly');
  }
  
  // Check current URL and view
  console.log('Current URL:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
  
  // Look for dashboard indicators in the DOM
  const dashboardElements = document.querySelectorAll('[data-testid*="dashboard"], [class*="dashboard"], [id*="dashboard"]');
  console.log('Dashboard elements found:', dashboardElements.length);
  
  // Check for role-specific elements
  const adminElements = document.querySelectorAll('[data-testid*="admin"], [class*="admin"]');
  const studentElements = document.querySelectorAll('[data-testid*="student"], [class*="student"]');
  const registrarElements = document.querySelectorAll('[data-testid*="registrar"], [class*="registrar"]');
  
  console.log('Admin elements:', adminElements.length);
  console.log('Student elements:', studentElements.length);
  console.log('Registrar elements:', registrarElements.length);
  
  // Check console for useViewState debug logs
  console.log('Check browser console for useViewState debug logs to verify proper role-based navigation');
  console.log('=== TEST COMPLETE ===');
})();
