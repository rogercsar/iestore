// Advanced Icon & Text Investigation - React Native Web Specific
(function() {
  'use strict';
  
  console.log('🔍 ADVANCED INVESTIGATION: Deep analysis of missing icons and text issues...');
  
  function advancedInvestigation() {
    console.log('🔍 ADVANCED: Starting comprehensive analysis...');
    
    // 1. Check for React Native Web specific icon components
    console.log('🔍 ADVANCED: Checking for React Native Web icon components...');
    
    // Look for elements that might be icon components
    const allElements = document.querySelectorAll('*');
    let iconElements = [];
    let textElements = [];
    
    allElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      const innerHTML = element.innerHTML || '';
      const className = element.className || '';
      const classNameStr = typeof className === 'string' ? className : (className.toString ? className.toString() : '');
      
      // Check for potential icon elements
      if (text.length > 0 && text.length < 10) {
        // Check if it looks like an icon name
        const iconNames = [
          'home', 'favorite', 'settings', 'search', 'menu', 'close', 'add', 'remove',
          'edit', 'delete', 'person', 'shopping_cart', 'notifications', 'account_circle',
          'more_vert', 'arrow_back', 'arrow_forward', 'check', 'cancel', 'refresh',
          'save', 'print', 'share', 'download', 'upload', 'email', 'phone', 'location_on',
          'star', 'star_border', 'favorite_border', 'thumb_up', 'thumb_down', 'comment',
          'reply', 'forward', 'backup', 'restore', 'help', 'info', 'warning', 'error',
          'visibility', 'visibility_off', 'lock', 'lock_open', 'key', 'security',
          'dashboard', 'analytics', 'trending_up', 'trending_down', 'bar_chart',
          'pie_chart', 'timeline', 'schedule', 'event', 'today', 'date_range',
          'store', 'inventory', 'sell', 'history', 'chart', 'graph', 'data'
        ];
        
        if (iconNames.includes(text)) {
          iconElements.push({
            element: element,
            text: text,
            className: classNameStr,
            tagName: element.tagName,
            style: element.style.cssText,
            computedStyle: window.getComputedStyle(element).fontFamily,
            parentElement: element.parentElement?.tagName,
            parentClassName: element.parentElement?.className
          });
        }
      }
      
      // Check for text elements that might have rendering issues
      if (text.length > 0 && text.length < 100) {
        const isTextElement = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                              'a', 'button', 'input', 'textarea', 'label', 'li', 'td', 'th',
                              'strong', 'em', 'small', 'article', 'section', 'header', 'footer', 'nav', 'main'].includes(element.tagName.toLowerCase());
        
        if (isTextElement) {
          const computedStyle = window.getComputedStyle(element);
          textElements.push({
            element: element,
            text: text,
            className: classNameStr,
            tagName: element.tagName,
            style: element.style.cssText,
            computedFontFamily: computedStyle.fontFamily,
            computedFontSize: computedStyle.fontSize,
            computedColor: computedStyle.color,
            computedVisibility: computedStyle.visibility,
            computedDisplay: computedStyle.display,
            computedOpacity: computedStyle.opacity
          });
        }
      }
    });
    
    console.log(`🔍 ADVANCED: Found ${iconElements.length} potential icon elements`);
    if (iconElements.length > 0) {
      console.log('🔍 ADVANCED: Icon elements found:');
      iconElements.forEach((icon, index) => {
        if (index < 10) {
          console.log(`  - Icon ${index + 1}:`, {
            text: icon.text,
            tagName: icon.tagName,
            className: icon.className,
            computedFont: icon.computedStyle,
            parentElement: icon.parentElement,
            parentClassName: icon.parentClassName
          });
        }
      });
    }
    
    console.log(`🔍 ADVANCED: Found ${textElements.length} text elements`);
    if (textElements.length > 0) {
      console.log('🔍 ADVANCED: Text elements analysis:');
      textElements.forEach((text, index) => {
        if (index < 10) {
          console.log(`  - Text ${index + 1}:`, {
            text: text.text.substring(0, 50) + '...',
            tagName: text.tagName,
            className: text.className,
            computedFont: text.computedFontFamily,
            computedSize: text.computedFontSize,
            computedColor: text.computedColor,
            visibility: text.computedVisibility,
            display: text.computedDisplay,
            opacity: text.computedOpacity
          });
        }
      });
    }
    
    // 2. Check for React Native Web specific patterns
    console.log('🔍 ADVANCED: Checking for React Native Web patterns...');
    
    const rnwPatterns = [
      '[class*="css-"]', // CSS-in-JS classes
      '[class*="r-"]', // React Native Web classes
      '[style*="font"]', // Elements with font styles
      '[data-testid]', // Test IDs
      '[role]', // ARIA roles
      'svg', // SVG elements
      'canvas' // Canvas elements
    ];
    
    rnwPatterns.forEach(pattern => {
      try {
        const elements = document.querySelectorAll(pattern);
        if (elements.length > 0) {
          console.log(`🔍 ADVANCED: Found ${elements.length} elements with pattern: ${pattern}`);
          
          elements.forEach((element, index) => {
            if (index < 3) {
              const text = (element.textContent || element.innerText || '').trim();
              const computedStyle = window.getComputedStyle(element);
              console.log(`  - Element ${index + 1}:`, {
                tagName: element.tagName,
                className: element.className,
                text: text.substring(0, 30) + '...',
                computedFont: computedStyle.fontFamily,
                computedSize: computedStyle.fontSize,
                computedColor: computedStyle.color,
                visibility: computedStyle.visibility,
                display: computedStyle.display
              });
            }
          });
        }
      } catch (error) {
        console.warn(`🔍 ADVANCED: Error with pattern ${pattern}:`, error);
      }
    });
    
    // 3. Check font loading status
    console.log('🔍 ADVANCED: Checking font loading status...');
    
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        console.log('🔍 ADVANCED: Fonts loaded, checking specific fonts...');
        
        // Test Material Icons
        const testMaterialIcons = document.createElement('div');
        testMaterialIcons.style.fontFamily = 'Material Icons';
        testMaterialIcons.style.fontSize = '24px';
        testMaterialIcons.textContent = 'home';
        testMaterialIcons.style.position = 'absolute';
        testMaterialIcons.style.left = '-9999px';
        document.body.appendChild(testMaterialIcons);
        
        const materialIconsStyle = window.getComputedStyle(testMaterialIcons);
        console.log('🔍 ADVANCED: Material Icons test:', {
          requestedFont: 'Material Icons',
          computedFont: materialIconsStyle.fontFamily,
          isLoaded: materialIconsStyle.fontFamily.includes('Material Icons'),
          fontSize: materialIconsStyle.fontSize
        });
        
        document.body.removeChild(testMaterialIcons);
        
        // Test system fonts
        const testSystemFont = document.createElement('div');
        testSystemFont.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif';
        testSystemFont.style.fontSize = '16px';
        testSystemFont.textContent = 'Test text';
        testSystemFont.style.position = 'absolute';
        testSystemFont.style.left = '-9999px';
        document.body.appendChild(testSystemFont);
        
        const systemFontStyle = window.getComputedStyle(testSystemFont);
        console.log('🔍 ADVANCED: System font test:', {
          requestedFont: 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
          computedFont: systemFontStyle.fontFamily,
          fontSize: systemFontStyle.fontSize
        });
        
        document.body.removeChild(testSystemFont);
      });
    }
    
    // 4. Check for CSS conflicts
    console.log('🔍 ADVANCED: Checking for CSS conflicts...');
    
    const conflictingSelectors = [
      '* { font-family: !important; }',
      'body { font-family: !important; }',
      '#root { font-family: !important; }',
      '[class*="css-"] { font-family: !important; }'
    ];
    
    // Check if any of these patterns exist in the stylesheets
    const stylesheets = document.styleSheets;
    for (let i = 0; i < stylesheets.length; i++) {
      try {
        const rules = stylesheets[i].cssRules || stylesheets[i].rules;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule.style && rule.style.fontFamily) {
            console.log('🔍 ADVANCED: Found font-family rule:', {
              selector: rule.selectorText,
              fontFamily: rule.style.fontFamily,
              important: rule.style.getPropertyPriority('font-family') === 'important'
            });
          }
        }
      } catch (error) {
        // Cross-origin stylesheets might throw errors
        console.warn('🔍 ADVANCED: Could not access stylesheet:', error);
      }
    }
    
    // 5. Summary
    console.log('🔍 ADVANCED: Investigation Summary:');
    console.log(`  - Icon elements found: ${iconElements.length}`);
    console.log(`  - Text elements found: ${textElements.length}`);
    console.log(`  - Total elements analyzed: ${allElements.length}`);
    
    if (iconElements.length === 0) {
      console.log('🔍 ADVANCED: WARNING: No icon elements found!');
      console.log('🔍 ADVANCED: This suggests the app might not be using Material Icons as expected.');
    }
    
    if (textElements.length > 0) {
      const problematicTexts = textElements.filter(text => 
        text.computedFontFamily.includes('Material Icons') || 
        text.computedOpacity === '0' || 
        text.computedVisibility === 'hidden' ||
        text.computedDisplay === 'none'
      );
      
      if (problematicTexts.length > 0) {
        console.log(`🔍 ADVANCED: WARNING: Found ${problematicTexts.length} problematic text elements!`);
        console.log('🔍 ADVANCED: These elements might have rendering issues.');
      }
    }
  }
  
  // Run investigation with delays
  setTimeout(advancedInvestigation, 2000);
  setTimeout(advancedInvestigation, 5000);
  setTimeout(advancedInvestigation, 8000);
  
})();
