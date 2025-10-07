// Debug Script - Investigate Icon Detection in Real App
(function() {
  'use strict';
  
  console.log('🔍 DEBUG: Starting icon investigation...');
  
  function debugIconDetection() {
    console.log('🔍 DEBUG: Analyzing DOM for icons...');
    
    // Check all elements with potential icon classes
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
    
    let totalFound = 0;
    
    iconSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`🔍 Found ${elements.length} elements with selector: ${selector}`);
          elements.forEach((element, index) => {
            if (index < 5) { // Show first 5 examples
              console.log(`  - Element ${index + 1}:`, {
                tagName: element.tagName,
                className: element.className,
                textContent: element.textContent?.trim(),
                innerHTML: element.innerHTML,
                computedStyle: window.getComputedStyle(element).fontFamily
              });
            }
          });
          totalFound += elements.length;
        }
      } catch (error) {
        console.warn(`🔍 Error with selector ${selector}:`, error);
      }
    });
    
    console.log(`🔍 Total elements found with icon selectors: ${totalFound}`);
    
    // Check for elements with icon text content
    const iconNames = [
      'home', 'favorite', 'settings', 'search', 'menu', 'close', 'add', 'remove',
      'edit', 'delete', 'person', 'shopping_cart', 'notifications', 'account_circle',
      'more_vert', 'arrow_back', 'arrow_forward', 'check', 'cancel', 'refresh'
    ];
    
    let textIconsFound = 0;
    iconNames.forEach(iconName => {
      const elements = document.querySelectorAll(`*`);
      elements.forEach(element => {
        const text = (element.textContent || element.innerText || '').trim();
        if (text === iconName && element.children.length === 0) {
          textIconsFound++;
          if (textIconsFound <= 10) { // Show first 10 examples
            console.log(`🔍 Found text icon "${iconName}":`, {
              tagName: element.tagName,
              className: element.className,
              textContent: element.textContent,
              computedStyle: window.getComputedStyle(element).fontFamily
            });
          }
        }
      });
    });
    
    console.log(`🔍 Total text-based icons found: ${textIconsFound}`);
    
    // Check all elements for any potential icons
    const allElements = document.querySelectorAll('*');
    let potentialIcons = 0;
    
    allElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      const className = element.className || '';
      const classNameStr = typeof className === 'string' ? className : (className.toString ? className.toString() : '');
      const tagName = element.tagName.toLowerCase();
      
      // Check if it looks like an icon
      const isShortText = text.length > 0 && text.length < 20;
      const hasIconClass = classNameStr.includes('icon') || classNameStr.includes('material') || classNameStr.includes('ion');
      const isIconName = iconNames.includes(text);
      const isNotTextTag = !['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'label', 'li', 'td', 'th'].includes(tagName);
      
      if (isShortText && (hasIconClass || (isIconName && isNotTextTag))) {
        potentialIcons++;
        if (potentialIcons <= 10) { // Show first 10 examples
          console.log(`🔍 Potential icon element:`, {
            tagName: element.tagName,
            className: element.className,
            textContent: element.textContent,
            computedStyle: window.getComputedStyle(element).fontFamily,
            isShortText,
            hasIconClass,
            isIconName,
            isNotTextTag
          });
        }
      }
    });
    
    console.log(`🔍 Total potential icons found: ${potentialIcons}`);
    
    // Check font loading status
    document.fonts.ready.then(() => {
      console.log('🔍 Fonts loaded, checking Material Icons availability...');
      
      const testElement = document.createElement('div');
      testElement.style.fontFamily = 'Material Icons';
      testElement.style.fontSize = '24px';
      testElement.textContent = 'home';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const fontFamily = computedStyle.fontFamily;
      
      console.log('🔍 Material Icons font test:', {
        requestedFont: 'Material Icons',
        computedFont: fontFamily,
        isLoaded: fontFamily.includes('Material Icons')
      });
      
      document.body.removeChild(testElement);
    });
  }
  
  // Run debug after a delay to let the app load
  setTimeout(debugIconDetection, 2000);
  setTimeout(debugIconDetection, 5000);
  
})();
