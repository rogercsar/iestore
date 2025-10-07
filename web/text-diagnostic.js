// Text Rendering Diagnostic Script - Development Issues
(function() {
  'use strict';
  
  console.log('🔧 TEXT DIAGNOSTIC: Starting text rendering analysis...');
  
  function diagnoseTextIssues() {
    console.log('🔧 TEXT DIAGNOSTIC: Analyzing text rendering problems...');
    
    // 1. Check for elements with missing or broken text
    const allElements = document.querySelectorAll('*');
    let textIssues = [];
    let totalTextElements = 0;
    
    allElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;
      const fontSize = computedStyle.fontSize;
      const color = computedStyle.color;
      const visibility = computedStyle.visibility;
      const display = computedStyle.display;
      const opacity = computedStyle.opacity;
      
      // Check if element should have text
      const isTextElement = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                            'a', 'button', 'input', 'textarea', 'label', 'li', 'td', 'th',
                            'strong', 'em', 'small', 'article', 'section', 'header', 'footer', 'nav', 'main'].includes(element.tagName.toLowerCase());
      
      if (isTextElement && text.length > 0) {
        totalTextElements++;
        
        // Check for potential issues
        const issues = [];
        
        // Check if using icon font for text (problematic)
        if (fontFamily.includes('Material Icons') && !element.className.includes('icon')) {
          issues.push('Using icon font for text');
        }
        
        // Check if text is invisible
        if (opacity === '0' || visibility === 'hidden' || display === 'none') {
          issues.push('Text is invisible');
        }
        
        // Check if font size is too small
        const fontSizeNum = parseFloat(fontSize);
        if (fontSizeNum < 8) {
          issues.push('Font size too small: ' + fontSize);
        }
        
        // Check if color is transparent or same as background
        if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
          issues.push('Text color is transparent');
        }
        
        // Check for missing letters (partial text)
        if (text.length > 0 && text.length < 50) {
          const hasMissingLetters = /[^\w\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/.test(text);
          if (hasMissingLetters) {
            issues.push('Text contains special characters that might not render');
          }
        }
        
        if (issues.length > 0) {
          textIssues.push({
            element: element,
            text: text,
            issues: issues,
            tagName: element.tagName,
            className: element.className,
            fontFamily: fontFamily,
            fontSize: fontSize,
            color: color,
            visibility: visibility,
            display: display,
            opacity: opacity
          });
        }
      }
    });
    
    console.log(`🔧 TEXT DIAGNOSTIC: Found ${textIssues.length} problematic text elements out of ${totalTextElements} total`);
    
    if (textIssues.length > 0) {
      console.log('🔧 TEXT DIAGNOSTIC: Problematic elements:');
      textIssues.forEach((issue, index) => {
        if (index < 10) { // Show first 10
          console.log(`  - Issue ${index + 1}:`, {
            text: issue.text.substring(0, 50) + '...',
            tagName: issue.tagName,
            className: issue.className,
            issues: issue.issues,
            fontFamily: issue.fontFamily,
            fontSize: issue.fontSize,
            color: issue.color
          });
        }
      });
    }
    
    // 2. Check for CSS conflicts
    console.log('🔧 TEXT DIAGNOSTIC: Checking for CSS conflicts...');
    
    const conflictingRules = [];
    const stylesheets = document.styleSheets;
    
    for (let i = 0; i < stylesheets.length; i++) {
      try {
        const rules = stylesheets[i].cssRules || stylesheets[i].rules;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule.style && rule.style.fontFamily) {
            const fontFamily = rule.style.fontFamily;
            const important = rule.style.getPropertyPriority('font-family') === 'important';
            
            // Check for problematic font rules
            if (fontFamily.includes('Material Icons') && !rule.selectorText.includes('icon')) {
              conflictingRules.push({
                selector: rule.selectorText,
                fontFamily: fontFamily,
                important: important,
                type: 'Icon font applied to non-icon elements'
              });
            }
            
            if (important && fontFamily.includes('system-ui')) {
              conflictingRules.push({
                selector: rule.selectorText,
                fontFamily: fontFamily,
                important: important,
                type: 'Important system font rule'
              });
            }
          }
        }
      } catch (error) {
        // Cross-origin stylesheets might throw errors
        console.warn('🔧 TEXT DIAGNOSTIC: Could not access stylesheet:', error);
      }
    }
    
    if (conflictingRules.length > 0) {
      console.log('🔧 TEXT DIAGNOSTIC: Conflicting CSS rules found:');
      conflictingRules.forEach((rule, index) => {
        console.log(`  - Rule ${index + 1}:`, rule);
      });
    }
    
    // 3. Test specific text rendering
    console.log('🔧 TEXT DIAGNOSTIC: Testing specific text rendering...');
    
    const testTexts = ['Dashboard', 'Resumo do Negócio', 'Total de Vendas', 'Estoque', 'Vender', 'Histórico'];
    
    testTexts.forEach(testText => {
      const elements = Array.from(allElements).filter(el => 
        (el.textContent || el.innerText || '').includes(testText)
      );
      
      if (elements.length > 0) {
        const element = elements[0];
        const computedStyle = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        console.log(`🔧 TEXT DIAGNOSTIC: "${testText}" rendering:`, {
          tagName: element.tagName,
          className: element.className,
          fontFamily: computedStyle.fontFamily,
          fontSize: computedStyle.fontSize,
          color: computedStyle.color,
          width: rect.width,
          height: rect.height,
          visible: rect.width > 0 && rect.height > 0
        });
      } else {
        console.log(`🔧 TEXT DIAGNOSTIC: "${testText}" not found in DOM`);
      }
    });
    
    // 4. Check for font loading issues
    console.log('🔧 TEXT DIAGNOSTIC: Checking font loading...');
    
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        console.log('🔧 TEXT DIAGNOSTIC: Fonts loaded, checking specific fonts...');
        
        const systemFont = document.fonts.check('16px system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif');
        const materialIcons = document.fonts.check('16px Material Icons');
        
        console.log('🔧 TEXT DIAGNOSTIC: Font availability:', {
          'System fonts': systemFont,
          'Material Icons': materialIcons
        });
        
        if (!systemFont) {
          console.log('🔧 TEXT DIAGNOSTIC: WARNING: System fonts not available!');
        }
      });
    }
    
    // 5. Summary and recommendations
    console.log('🔧 TEXT DIAGNOSTIC: Summary:');
    console.log(`  - Total text elements: ${totalTextElements}`);
    console.log(`  - Problematic elements: ${textIssues.length}`);
    console.log(`  - Conflicting CSS rules: ${conflictingRules.length}`);
    
    if (textIssues.length > 0) {
      console.log('🔧 TEXT DIAGNOSTIC: RECOMMENDATIONS:');
      console.log('  1. Check if icon fonts are being applied to text elements');
      console.log('  2. Verify font loading is working correctly');
      console.log('  3. Check for CSS conflicts with !important rules');
      console.log('  4. Ensure text elements have proper visibility settings');
    }
  }
  
  // Run diagnosis with delays
  setTimeout(diagnoseTextIssues, 1000);
  setTimeout(diagnoseTextIssues, 3000);
  setTimeout(diagnoseTextIssues, 5000);
  
})();
