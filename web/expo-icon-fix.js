// Expo Icon Fix Script - Run after Expo app loads
(function() {
  'use strict';
  
  console.log('Expo Icon Fix Script loaded');
  
  // Wait for Expo app to fully load
  function waitForExpoApp() {
    return new Promise((resolve) => {
      const checkForExpo = () => {
        // Check if Expo app is loaded by looking for common Expo elements
        const expoElements = document.querySelectorAll('[data-testid], [class*="expo"], #root > div');
        if (expoElements.length > 0) {
          console.log('Expo app detected, applying icon fixes...');
          resolve();
        } else {
          setTimeout(checkForExpo, 100);
        }
      };
      checkForExpo();
    });
  }
  
  // Ensure text elements use system fonts
  function ensureTextUsesSystemFonts() {
    console.log('Ensuring text elements use system fonts...');
    
    const textSelectors = [
      'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'a', 'button', 'input', 'textarea', 'label', 'li', 'td', 'th',
      'strong', 'em', 'small', 'article', 'section', 'header', 'footer', 'nav', 'main'
    ];
    
    textSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Only apply system fonts if element doesn't contain icon text
        const text = (element.textContent || element.innerText || '').trim();
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
        
        // If element contains icon text and has no children, it's likely an icon
        const isIcon = iconNames.includes(text) && element.children.length === 0;
        
        if (!isIcon) {
          // Apply system fonts to text elements
          element.style.setProperty('font-family', 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif', 'important');
          element.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
          element.style.setProperty('-moz-osx-font-smoothing', 'grayscale', 'important');
          element.style.setProperty('text-rendering', 'optimizeLegibility', 'important');
        }
      });
    });
  }
  
  // Aggressive icon font application (more specific)
  function applyIconFontsAggressively() {
    console.log('Applying icon fonts aggressively...');
    
    // List of common Material Icons
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
    
    // Find elements that are definitely icons
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
    
    let iconsFixed = 0;
    
    // Apply to elements with icon classes/attributes
    iconSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.setProperty('font-family', '"Material Icons"', 'important');
        element.style.setProperty('font-size', '24px', 'important');
        element.style.setProperty('font-weight', 'normal', 'important');
        element.style.setProperty('font-style', 'normal', 'important');
        element.style.setProperty('display', 'inline-block', 'important');
        element.style.setProperty('white-space', 'nowrap', 'important');
        iconsFixed++;
      });
    });
    
    // Apply to elements with icon text content (more conservative)
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      
      // Only apply if element contains exactly one icon name and has no children
      if (iconNames.includes(text) && element.children.length === 0 && text.length < 20) {
        // Double-check: make sure it's not a text element with icon name
        const tagName = element.tagName.toLowerCase();
        const isTextElement = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'label', 'li', 'td', 'th'].includes(tagName);
        
        // Only apply icon font if it's not a typical text element or if it has icon-related classes
        const hasIconClass = element.className && (
          element.className.includes('icon') || 
          element.className.includes('material') || 
          element.className.includes('ion')
        );
        
        if (!isTextElement || hasIconClass) {
          element.style.setProperty('font-family', '"Material Icons"', 'important');
          element.style.setProperty('font-size', '24px', 'important');
          element.style.setProperty('font-weight', 'normal', 'important');
          element.style.setProperty('font-style', 'normal', 'important');
          element.style.setProperty('display', 'inline-block', 'important');
          element.style.setProperty('white-space', 'nowrap', 'important');
          iconsFixed++;
        }
      }
    });
    
    console.log(`Fixed ${iconsFixed} icon elements`);
  }
  
  // Run the fix
  waitForExpoApp().then(() => {
    // Apply fixes immediately
    ensureTextUsesSystemFonts();
    applyIconFontsAggressively();
    
    // Apply fixes again after delays
    setTimeout(() => {
      ensureTextUsesSystemFonts();
      applyIconFontsAggressively();
    }, 1000);
    
    setTimeout(() => {
      ensureTextUsesSystemFonts();
      applyIconFontsAggressively();
    }, 3000);
    
    setTimeout(() => {
      ensureTextUsesSystemFonts();
      applyIconFontsAggressively();
    }, 5000);
    
    // Watch for new elements being added
    if (window.MutationObserver) {
      const observer = new MutationObserver(function(mutations) {
        let shouldReapply = false;
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldReapply = true;
          }
        });
        
        if (shouldReapply) {
          setTimeout(() => {
            ensureTextUsesSystemFonts();
            applyIconFontsAggressively();
          }, 100);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });
  
})();
