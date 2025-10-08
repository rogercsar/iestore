// React Native Web Structure Investigation Script
(function() {
  'use strict';
  
  console.log('🔍 RNW INVESTIGATION: Starting structure analysis...');
  
  function analyzeStructure() {
    console.log('🔍 RNW INVESTIGATION: Analyzing DOM structure...');
    
    // Find all text elements
    const allElements = document.querySelectorAll('*');
    const textElements = [];
    
    allElements.forEach((element, index) => {
      const text = (element.textContent || '').trim();
      if (text && text.length > 0 && text.length < 100) {
        textElements.push({
          index,
          tagName: element.tagName,
          className: element.className,
          text: text,
          innerHTML: element.innerHTML.substring(0, 200),
          style: element.style.cssText,
          computedStyle: window.getComputedStyle(element).fontFamily
        });
      }
    });
    
    console.log('🔍 RNW INVESTIGATION: Found text elements:', textElements.length);
    
    // Look for navigation patterns
    const navElements = textElements.filter(el => 
      el.text.includes('Dashboard') || 
      el.text.includes('Estoque') || 
      el.text.includes('Vender') || 
      el.text.includes('Histórico')
    );
    
    console.log('🔍 RNW INVESTIGATION: Navigation elements found:', navElements.length);
    navElements.forEach((el, i) => {
      console.log(`🔍 Nav ${i + 1}:`, {
        tagName: el.tagName,
        className: el.className,
        text: el.text,
        style: el.style,
        computedStyle: el.computedStyle
      });
    });
    
    // Look for React Native Web specific classes
    const rnwElements = Array.from(document.querySelectorAll('[class*="css-"]'));
    console.log('🔍 RNW INVESTIGATION: React Native Web elements found:', rnwElements.length);
    
    // Look for specific patterns
    const patterns = {
      'Dashboard': document.querySelectorAll('*:contains("Dashboard")'),
      'Estoque': document.querySelectorAll('*:contains("Estoque")'),
      'Vender': document.querySelectorAll('*:contains("Vender")'),
      'Histórico': document.querySelectorAll('*:contains("Histórico")')
    };
    
    Object.keys(patterns).forEach(key => {
      console.log(`🔍 RNW INVESTIGATION: ${key} elements:`, patterns[key].length);
    });
    
    // Look for clickable elements
    const clickableElements = document.querySelectorAll('a, button, [role="button"], [onclick], [style*="cursor: pointer"]');
    console.log('🔍 RNW INVESTIGATION: Clickable elements found:', clickableElements.length);
    
    clickableElements.forEach((el, i) => {
      const text = (el.textContent || '').trim();
      if (text && text.length < 50) {
        console.log(`🔍 Clickable ${i + 1}:`, {
          tagName: el.tagName,
          className: el.className,
          text: text,
          style: el.style.cssText
        });
      }
    });
    
    // Look for layout containers
    const layoutContainers = document.querySelectorAll('div[style*="display"], div[style*="flex"], div[style*="grid"]');
    console.log('🔍 RNW INVESTIGATION: Layout containers found:', layoutContainers.length);
    
    // Look for sales-related elements
    const salesElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = (el.textContent || '').trim();
      return text.includes('Vendas por dia') || text.includes('Total vendido') || text.includes('R$');
    });
    
    console.log('🔍 RNW INVESTIGATION: Sales elements found:', salesElements.length);
    salesElements.forEach((el, i) => {
      console.log(`🔍 Sales ${i + 1}:`, {
        tagName: el.tagName,
        className: el.className,
        text: (el.textContent || '').trim().substring(0, 100),
        style: el.style.cssText,
        parentStyle: el.parentElement ? el.parentElement.style.cssText : 'no parent'
      });
    });
    
    // Look for SVG elements (charts)
    const svgElements = document.querySelectorAll('svg');
    console.log('🔍 RNW INVESTIGATION: SVG elements found:', svgElements.length);
    svgElements.forEach((svg, i) => {
      console.log(`🔍 SVG ${i + 1}:`, {
        className: svg.className,
        viewBox: svg.getAttribute('viewBox'),
        style: svg.style.cssText,
        parentStyle: svg.parentElement ? svg.parentElement.style.cssText : 'no parent',
        dimensions: {
          width: svg.getAttribute('width') || svg.style.width,
          height: svg.getAttribute('height') || svg.style.height
        }
      });
    });
    
    console.log('🔍 RNW INVESTIGATION: Structure analysis complete');
  }
  
  // Run investigation after DOM is loaded
  setTimeout(analyzeStructure, 1000);
  setTimeout(analyzeStructure, 3000);
  
})();
