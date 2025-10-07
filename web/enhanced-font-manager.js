// Enhanced Font Management Script - Based on test-icons.html approach
(function() {
  'use strict';
  
  console.log('🎯 Enhanced Font Management Script loaded');
  
  // Wait for fonts to load
  function waitForFonts() {
    return new Promise((resolve) => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          console.log('🎯 Fonts loaded successfully');
          resolve();
        });
      } else {
        // Fallback for browsers without document.fonts
        setTimeout(resolve, 1000);
      }
    });
  }
  
  // Apply Material Icons font to specific elements
  function applyMaterialIcons() {
    console.log('🎯 Applying Material Icons...');
    
    // Direct selectors that work in test-icons.html
    const iconSelectors = [
      '.material-icons',
      '.material-community-icons',
      '.ionicons',
      '[class*="MaterialIcons"]',
      '[class*="MaterialCommunityIcons"]',
      '[class*="Ionicons"]',
      '[class*="icon"]',
      '[data-icon]',
      '[aria-label*="icon"]',
      '[title*="icon"]',
      '[role="img"]',
      '[data-testid*="icon"]'
    ];
    
    let iconsApplied = 0;
    
    iconSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Apply the exact same styles as test-icons.html
          element.style.fontFamily = 'Material Icons';
          element.style.fontSize = '24px';
          element.style.fontWeight = 'normal';
          element.style.fontStyle = 'normal';
          element.style.display = 'inline-block';
          element.style.verticalAlign = 'middle';
          element.style.webkitFontSmoothing = 'antialiased';
          element.style.mozOsxFontSmoothing = 'grayscale';
          element.style.textRendering = 'optimizeLegibility';
          iconsApplied++;
        });
      } catch (error) {
        console.warn('🎯 Error with selector:', selector, error);
      }
    });
    
    console.log(`🎯 Applied Material Icons to ${iconsApplied} elements`);
    return iconsApplied;
  }
  
  // Apply system fonts to text elements
  function applySystemFonts() {
    console.log('🎯 Applying system fonts...');
    
    const textSelectors = [
      'body', 'html', '#root', '#app',
      'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'button', 'input', 'textarea', 'label',
      'li', 'td', 'th', 'strong', 'em', 'small',
      'article', 'section', 'header', 'footer', 'nav', 'main'
    ];
    
    let textApplied = 0;
    
    textSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Skip if it's already an icon element
          const className = element.className || '';
          const classNameStr = typeof className === 'string' ? className : (className.toString ? className.toString() : '');
          if (classNameStr.includes('icon') || classNameStr.includes('material') || classNameStr.includes('ion')) {
            return;
          }
          
          element.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif';
          element.style.webkitFontSmoothing = 'antialiased';
          element.style.mozOsxFontSmoothing = 'grayscale';
          element.style.textRendering = 'optimizeLegibility';
          textApplied++;
        });
      } catch (error) {
        console.warn('🎯 Error with text selector:', selector, error);
      }
    });
    
    console.log(`🎯 Applied system fonts to ${textApplied} elements`);
    return textApplied;
  }
  
  // Main function
  function applyEnhancedFontManagement() {
    console.log('🎯 Starting enhanced font management...');
    
    // Apply system fonts first
    const textCount = applySystemFonts();
    
    // Wait a bit for fonts to load, then apply icons
    setTimeout(() => {
      const iconCount = applyMaterialIcons();
      console.log(`🎯 Enhanced font management complete: ${textCount} text elements, ${iconCount} icon elements`);
    }, 100);
  }
  
  // Wait for Expo app and fonts, then apply
  function waitForExpoAndApply() {
    return new Promise((resolve) => {
      const checkForExpo = () => {
        const rootElement = document.getElementById('root');
        if (rootElement && rootElement.children.length > 0) {
          console.log('🎯 Expo app detected');
          resolve();
        } else {
          setTimeout(checkForExpo, 100);
        }
      };
      checkForExpo();
    });
  }
  
  // Run the enhanced management
  Promise.all([waitForExpoAndApply(), waitForFonts()]).then(() => {
    // Apply immediately
    applyEnhancedFontManagement();
    
    // Apply with delays to catch dynamic content
    setTimeout(applyEnhancedFontManagement, 500);
    setTimeout(applyEnhancedFontManagement, 1500);
    setTimeout(applyEnhancedFontManagement, 3000);
    setTimeout(applyEnhancedFontManagement, 5000);
    
    // Watch for DOM changes
    if (window.MutationObserver) {
      const observer = new MutationObserver(function(mutations) {
        let shouldReapply = false;
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldReapply = true;
          }
        });
        
        if (shouldReapply) {
          setTimeout(applyEnhancedFontManagement, 200);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }).catch(error => {
    console.error('🎯 Error in enhanced font management:', error);
  });
  
})();
