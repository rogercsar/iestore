// Deep Icon Investigation Script - React Native Web Specific
(function() {
  'use strict';
  
  console.log('🔬 DEEP INVESTIGATION: Starting React Native Web icon analysis...');
  
  function deepInvestigateIcons() {
    console.log('🔬 DEEP INVESTIGATION: Analyzing React Native Web structure...');
    
    // 1. Check the root element and its children
    const root = document.getElementById('root');
    if (root) {
      console.log('🔬 Root element found:', {
        tagName: root.tagName,
        className: root.className,
        childrenCount: root.children.length,
        innerHTML: root.innerHTML.substring(0, 500) + '...'
      });
    }
    
    // 2. Look for React Native Web specific elements
    const rnwSelectors = [
      '[data-testid]',
      '[role]',
      '[aria-label]',
      '[title]',
      'div[style*="font"]',
      'span[style*="font"]',
      'i[style*="font"]',
      '[class*="expo"]',
      '[class*="react"]',
      '[class*="native"]'
    ];
    
    rnwSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`🔬 Found ${elements.length} elements with selector: ${selector}`);
          elements.forEach((element, index) => {
            if (index < 3) { // Show first 3 examples
              const computedStyle = window.getComputedStyle(element);
              console.log(`  - Element ${index + 1}:`, {
                tagName: element.tagName,
                className: element.className,
                textContent: element.textContent?.trim(),
                innerHTML: element.innerHTML,
                style: element.style.cssText,
                computedFontFamily: computedStyle.fontFamily,
                computedFontSize: computedStyle.fontSize,
                role: element.getAttribute('role'),
                'data-testid': element.getAttribute('data-testid'),
                'aria-label': element.getAttribute('aria-label'),
                title: element.getAttribute('title')
              });
            }
          });
        }
      } catch (error) {
        console.warn(`🔬 Error with selector ${selector}:`, error);
      }
    });
    
    // 3. Look for elements with icon-like text content
    const iconTexts = ['home', 'favorite', 'settings', 'search', 'menu', 'close', 'add', 'remove', 'edit', 'delete'];
    iconTexts.forEach(iconText => {
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        const text = (element.textContent || element.innerText || '').trim();
        if (text === iconText) {
          const computedStyle = window.getComputedStyle(element);
          console.log(`🔬 Found text icon "${iconText}":`, {
            tagName: element.tagName,
            className: element.className,
            textContent: element.textContent,
            innerHTML: element.innerHTML,
            style: element.style.cssText,
            computedFontFamily: computedStyle.fontFamily,
            computedFontSize: computedStyle.fontSize,
            parentElement: element.parentElement?.tagName,
            parentClassName: element.parentElement?.className
          });
        }
      });
    });
    
    // 4. Check for SVG elements (React Native Web might use SVGs)
    const svgElements = document.querySelectorAll('svg, [class*="svg"], [data-svg]');
    if (svgElements.length > 0) {
      console.log(`🔬 Found ${svgElements.length} SVG elements`);
      svgElements.forEach((element, index) => {
        if (index < 3) {
          console.log(`  - SVG ${index + 1}:`, {
            tagName: element.tagName,
            className: element.className,
            innerHTML: element.innerHTML.substring(0, 200) + '...',
            viewBox: element.getAttribute('viewBox'),
            role: element.getAttribute('role')
          });
        }
      });
    }
    
    // 5. Check for elements with specific React Native Web patterns
    const allElements = document.querySelectorAll('*');
    let rnwElements = 0;
    
    allElements.forEach(element => {
      const className = element.className || '';
      const classNameStr = typeof className === 'string' ? className : (className.toString ? className.toString() : '');
      
      // Look for React Native Web patterns
      if (classNameStr.includes('expo') || 
          classNameStr.includes('react') || 
          classNameStr.includes('native') ||
          element.hasAttribute('data-testid') ||
          element.hasAttribute('role') ||
          element.style.cssText.includes('font')) {
        rnwElements++;
        if (rnwElements <= 10) {
          console.log(`🔬 RNW Element ${rnwElements}:`, {
            tagName: element.tagName,
            className: classNameStr,
            textContent: element.textContent?.trim(),
            style: element.style.cssText,
            computedStyle: window.getComputedStyle(element).fontFamily,
            attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ')
          });
        }
      }
    });
    
    console.log(`🔬 Total React Native Web elements found: ${rnwElements}`);
    
    // 6. Check font loading status
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        console.log('🔬 Fonts loaded, checking Material Icons...');
        
        const testElement = document.createElement('div');
        testElement.style.fontFamily = 'Material Icons';
        testElement.style.fontSize = '24px';
        testElement.textContent = 'home';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        console.log('🔬 Material Icons test:', {
          requestedFont: 'Material Icons',
          computedFont: computedStyle.fontFamily,
          isLoaded: computedStyle.fontFamily.includes('Material Icons'),
          fontSize: computedStyle.fontSize
        });
        
        document.body.removeChild(testElement);
      });
    }
  }
  
  // Run investigation with delays
  setTimeout(deepInvestigateIcons, 1000);
  setTimeout(deepInvestigateIcons, 3000);
  setTimeout(deepInvestigateIcons, 5000);
  
})();
