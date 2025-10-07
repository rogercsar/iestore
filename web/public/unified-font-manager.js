// Unified Font Management Script - Handles both text and icons (Robust Version)
(function() {
  'use strict';
  
  console.log('Unified Font Management Script loaded');
  
  // Wait for Expo app to fully load
  function waitForExpoApp() {
    return new Promise((resolve) => {
      const checkForExpo = () => {
        const expoElements = document.querySelectorAll('[data-testid], [class*="expo"], #root > div');
        if (expoElements.length > 0) {
          console.log('Expo app detected, applying unified font management...');
          resolve();
        } else {
          setTimeout(checkForExpo, 100);
        }
      };
      checkForExpo();
    });
  }
  
  // Safe function to get className as string
  function getClassNameAsString(element) {
    try {
      if (!element || !element.className) return '';
      
      if (typeof element.className === 'string') {
        return element.className;
      }
      
      if (element.className.toString) {
        return element.className.toString();
      }
      
      return '';
    } catch (error) {
      console.warn('Error getting className:', error);
      return '';
    }
  }
  
  // Safe function to check if string contains substring
  function safeIncludes(str, substring) {
    try {
      return typeof str === 'string' && str.includes(substring);
    } catch (error) {
      return false;
    }
  }
  
  // Unified font management function
  function applyUnifiedFontManagement() {
    console.log('Applying unified font management...');
    
    const iconNames = [
      'home', 'favorite', 'settings', 'search', 'menu', 'close', 'add', 'remove', 
      'edit', 'delete', 'person', 'shopping_cart', 'notifications', 'account_circle', 
      'more_vert', 'arrow_back', 'arrow_forward', 'check', 'cancel', 'refresh', 
      'save', 'print', 'share', 'download', 'upload', 'email', 'phone', 'location_on',
      'star', 'star_border', 'favorite_border', 'thumb_up', 'thumb_down', 'comment',
      'reply', 'forward', 'backup', 'restore', 'help', 'info', 'warning', 'error',
      'visibility', 'visibility_off', 'lock', 'lock_open', 'key', 'security',
      'dashboard', 'analytics', 'trending_up', 'trending_down', 'bar_chart',
      'pie_chart', 'timeline', 'schedule', 'event', 'today', 'date_range'
    ];
    
    let textElementsFixed = 0;
    let iconElementsFixed = 0;
    
    try {
      // Process all elements
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(element => {
        try {
          const text = (element.textContent || element.innerText || '').trim();
          const tagName = element.tagName ? element.tagName.toLowerCase() : '';
          const classNameStr = getClassNameAsString(element);
          
          // Determine if element is likely an icon
          const isIconByClass = safeIncludes(classNameStr, 'icon') || 
                               safeIncludes(classNameStr, 'material') || 
                               safeIncludes(classNameStr, 'ion') ||
                               safeIncludes(classNameStr, 'MaterialIcons') ||
                               safeIncludes(classNameStr, 'MaterialCommunityIcons') ||
                               safeIncludes(classNameStr, 'Ionicons');
          
          const isIconByText = iconNames.includes(text) && 
                              element.children.length === 0 && 
                              text.length < 20;
          
          const isIconByAttribute = element.hasAttribute('data-icon') ||
                                   (element.hasAttribute('aria-label') && safeIncludes(element.getAttribute('aria-label'), 'icon')) ||
                                   (element.hasAttribute('title') && safeIncludes(element.getAttribute('title'), 'icon')) ||
                                   element.getAttribute('role') === 'img';
          
          const isDefinitelyIcon = isIconByClass || isIconByAttribute || 
                                  (isIconByText && !['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'label', 'li', 'td', 'th'].includes(tagName));
          
          if (isDefinitelyIcon) {
            // Apply icon fonts
            element.style.setProperty('font-family', '"Material Icons"', 'important');
            element.style.setProperty('font-size', '24px', 'important');
            element.style.setProperty('font-weight', 'normal', 'important');
            element.style.setProperty('font-style', 'normal', 'important');
            element.style.setProperty('display', 'inline-block', 'important');
            element.style.setProperty('white-space', 'nowrap', 'important');
            element.style.setProperty('text-transform', 'none', 'important');
            element.style.setProperty('letter-spacing', 'normal', 'important');
            element.style.setProperty('word-wrap', 'normal', 'important');
            element.style.setProperty('direction', 'ltr', 'important');
            element.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            element.style.setProperty('-moz-osx-font-smoothing', 'grayscale', 'important');
            element.style.setProperty('text-rendering', 'optimizeLegibility', 'important');
            iconElementsFixed++;
          } else {
            // Apply system fonts to text elements
            const isTextElement = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                                  'a', 'button', 'input', 'textarea', 'label', 'li', 'td', 'th',
                                  'strong', 'em', 'small', 'article', 'section', 'header', 'footer', 'nav', 'main'].includes(tagName);
            
            if (isTextElement || text.length > 0) {
              element.style.setProperty('font-family', 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif', 'important');
              element.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
              element.style.setProperty('-moz-osx-font-smoothing', 'grayscale', 'important');
              element.style.setProperty('text-rendering', 'optimizeLegibility', 'important');
              textElementsFixed++;
            }
          }
        } catch (elementError) {
          console.warn('Error processing element:', elementError);
        }
      });
      
      console.log(`Unified font management applied: ${textElementsFixed} text elements, ${iconElementsFixed} icon elements`);
    } catch (error) {
      console.error('Error in unified font management:', error);
    }
  }
  
  // Apply specific icon selectors
  function applyIconSelectors() {
    try {
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
      
      iconSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            element.style.setProperty('font-family', '"Material Icons"', 'important');
            element.style.setProperty('font-size', '24px', 'important');
            element.style.setProperty('font-weight', 'normal', 'important');
            element.style.setProperty('font-style', 'normal', 'important');
          });
        } catch (selectorError) {
          console.warn('Error with selector:', selector, selectorError);
        }
      });
    } catch (error) {
      console.error('Error applying icon selectors:', error);
    }
  }
  
  // Main execution function
  function executeUnifiedManagement() {
    try {
      // Clear any existing styles first
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        try {
          if (element.style && element.style.fontFamily) {
            element.style.removeProperty('font-family');
          }
        } catch (clearError) {
          // Ignore errors when clearing
        }
      });
      
      // Apply unified management
      applyUnifiedFontManagement();
      applyIconSelectors();
      
      // Ensure body uses system fonts
      if (document.body) {
        document.body.style.setProperty('font-family', 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif', 'important');
      }
    } catch (error) {
      console.error('Error in executeUnifiedManagement:', error);
    }
  }
  
  // Run the unified management
  waitForExpoApp().then(() => {
    // Execute immediately
    executeUnifiedManagement();
    
    // Execute with delays to catch dynamic content
    setTimeout(executeUnifiedManagement, 500);
    setTimeout(executeUnifiedManagement, 1500);
    setTimeout(executeUnifiedManagement, 3000);
    setTimeout(executeUnifiedManagement, 5000);
    
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
          setTimeout(executeUnifiedManagement, 200);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }).catch(error => {
    console.error('Error waiting for Expo app:', error);
  });
  
})();