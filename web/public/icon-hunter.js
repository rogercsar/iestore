// Icon Hunter Script - Find Real Icons in React Native Web App
(function() {
  'use strict';
  
  console.log('🎯 ICON HUNTER: Searching for real icons in the app...');
  
  function huntForIcons() {
    console.log('🎯 ICON HUNTER: Starting comprehensive icon search...');
    
    // 1. Look for elements that might contain icon characters
    const allElements = document.querySelectorAll('*');
    let potentialIcons = [];
    
    allElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      const innerHTML = element.innerHTML || '';
      
      // Check for single character elements that might be icons
      if (text.length === 1 && text !== ' ' && text !== '\n' && text !== '\t') {
        const charCode = text.charCodeAt(0);
        // Check if it's a potential icon character (not regular letters/numbers)
        if (charCode > 127 || (charCode >= 33 && charCode <= 126 && !/[a-zA-Z0-9]/.test(text))) {
          potentialIcons.push({
            element: element,
            text: text,
            charCode: charCode,
            className: element.className,
            tagName: element.tagName,
            style: element.style.cssText,
            computedStyle: window.getComputedStyle(element).fontFamily
          });
        }
      }
      
      // Check for elements with icon-like content
      if (text.length > 0 && text.length < 10) {
        const iconPatterns = [
          /^[^\w\s]+$/, // Non-word characters only
          /^[▲▼◀▶●○■□◆◇★☆]+$/, // Geometric shapes
          /^[←→↑↓↖↗↙↘]+$/, // Arrows
          /^[⚡🔥💡⭐🌟]+$/, // Common emoji-like characters
          /^[☰☱☲☳☴☵☶☷]+$/, // Trigram patterns
          /^[⚙⚡🔧🔨🔩]+$/ // Tool-like symbols
        ];
        
        if (iconPatterns.some(pattern => pattern.test(text))) {
          potentialIcons.push({
            element: element,
            text: text,
            type: 'pattern_match',
            className: element.className,
            tagName: element.tagName,
            style: element.style.cssText,
            computedStyle: window.getComputedStyle(element).fontFamily
          });
        }
      }
    });
    
    console.log(`🎯 ICON HUNTER: Found ${potentialIcons.length} potential icon elements`);
    
    if (potentialIcons.length > 0) {
      console.log('🎯 ICON HUNTER: Potential icons found:');
      potentialIcons.forEach((icon, index) => {
        if (index < 20) { // Show first 20
          console.log(`  - Icon ${index + 1}:`, {
            text: icon.text,
            charCode: icon.charCode,
            type: icon.type,
            tagName: icon.tagName,
            className: icon.className,
            computedFont: icon.computedStyle
          });
        }
      });
    }
    
    // 2. Look for elements with specific React Native Web icon patterns
    const rnwIconSelectors = [
      '[data-testid*="icon"]',
      '[aria-label*="icon"]',
      '[title*="icon"]',
      '[class*="icon"]',
      '[class*="Icon"]',
      '[class*="ICON"]',
      '[role="button"][aria-label]',
      '[role="button"][title]',
      'button[aria-label]',
      'button[title]'
    ];
    
    let rnwIcons = [];
    rnwIconSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          rnwIcons.push({
            element: element,
            selector: selector,
            text: element.textContent?.trim(),
            innerHTML: element.innerHTML,
            className: element.className,
            tagName: element.tagName,
            attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' '),
            computedStyle: window.getComputedStyle(element).fontFamily
          });
        });
      } catch (error) {
        console.warn(`🎯 ICON HUNTER: Error with selector ${selector}:`, error);
      }
    });
    
    console.log(`🎯 ICON HUNTER: Found ${rnwIcons.length} React Native Web icon elements`);
    
    if (rnwIcons.length > 0) {
      console.log('🎯 ICON HUNTER: React Native Web icons found:');
      rnwIcons.forEach((icon, index) => {
        if (index < 10) { // Show first 10
          console.log(`  - RNW Icon ${index + 1}:`, {
            selector: icon.selector,
            text: icon.text,
            innerHTML: icon.innerHTML,
            className: icon.className,
            tagName: icon.tagName,
            attributes: icon.attributes,
            computedFont: icon.computedStyle
          });
        }
      });
    }
    
    // 3. Check for elements that might be buttons or interactive elements
    const interactiveElements = document.querySelectorAll('button, [role="button"], [onclick], [onClick], [data-pressable], [data-press]');
    let interactiveIcons = [];
    
    interactiveElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      if (text.length > 0 && text.length < 5) {
        interactiveIcons.push({
          element: element,
          text: text,
          className: element.className,
          tagName: element.tagName,
          style: element.style.cssText,
          computedStyle: window.getComputedStyle(element).fontFamily,
          attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ')
        });
      }
    });
    
    console.log(`🎯 ICON HUNTER: Found ${interactiveIcons.length} interactive elements with short text`);
    
    if (interactiveIcons.length > 0) {
      console.log('🎯 ICON HUNTER: Interactive elements that might be icons:');
      interactiveIcons.forEach((icon, index) => {
        if (index < 10) { // Show first 10
          console.log(`  - Interactive ${index + 1}:`, {
            text: icon.text,
            tagName: icon.tagName,
            className: icon.className,
            computedFont: icon.computedStyle,
            attributes: icon.attributes
          });
        }
      });
    }
    
    // 4. Summary
    console.log('🎯 ICON HUNTER: Summary:');
    console.log(`  - Potential icon characters: ${potentialIcons.length}`);
    console.log(`  - React Native Web icons: ${rnwIcons.length}`);
    console.log(`  - Interactive elements: ${interactiveIcons.length}`);
    console.log(`  - Total potential icons: ${potentialIcons.length + rnwIcons.length + interactiveIcons.length}`);
    
    // 5. Check if the app actually has icons
    if (potentialIcons.length === 0 && rnwIcons.length === 0 && interactiveIcons.length === 0) {
      console.log('🎯 ICON HUNTER: CONCLUSION: This app might not have traditional icons!');
      console.log('🎯 ICON HUNTER: It might be using:');
      console.log('  - Text-based navigation (Dashboard, Estoque, Vender, Histórico)');
      console.log('  - SVG graphics for charts');
      console.log('  - CSS-based visual elements');
      console.log('  - No font-based icons');
    }
  }
  
  // Run the hunt with delays
  setTimeout(huntForIcons, 2000);
  setTimeout(huntForIcons, 5000);
  
})();
