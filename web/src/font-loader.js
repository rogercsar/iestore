// Font loading utility to ensure proper text rendering
(function() {
  'use strict';
  
  // Force system fonts for all text elements
  function forceSystemFonts() {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, input, textarea, label, li, td, th, strong, em, small, article, section, header, footer, nav, main');
    
    textElements.forEach(element => {
      element.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif';
      element.style.webkitFontSmoothing = 'antialiased';
      element.style.mozOsxFontSmoothing = 'grayscale';
      element.style.textRendering = 'optimizeLegibility';
    });
  }
  
  // Check icon fonts
  function checkIconFonts() {
    const iconElements = document.querySelectorAll('.material-icons, .material-community-icons, .ionicons, [class*="MaterialIcons"], [class*="MaterialCommunityIcons"], [class*="Ionicons"], i[class*="icon"], .icon');
    
    iconElements.forEach(element => {
      element.style.fontFamily = '"Material Icons", "MaterialCommunityIcons", "Ionicons", sans-serif';
    });
  }
  
  // Main function
  function ensureProperRendering() {
    console.log('Ensuring proper font rendering...');
    
    // Force system fonts for text
    forceSystemFonts();
    
    // Set up icon fonts
    checkIconFonts();
    
    // Set body font
    document.body.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif';
    
    console.log('Font rendering optimized');
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureProperRendering);
  } else {
    ensureProperRendering();
  }
  
  // Run after a delay to catch dynamic content
  setTimeout(ensureProperRendering, 500);
  setTimeout(ensureProperRendering, 2000);
  
  // Watch for DOM changes
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          setTimeout(ensureProperRendering, 100);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
})();
