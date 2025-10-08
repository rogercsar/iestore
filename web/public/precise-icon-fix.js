// Precise Material Icons Replacement Script - Only Specific Unicode Characters
(function() {
  'use strict';
  
  console.log('🎯 PRECISE ICON FIX: Starting precise Unicode replacement...');
  
  // Track processed elements to avoid duplicates
  const processedElements = new Set();
  
  // Only replace the specific Material Icons Unicode characters we found in the investigation
  const specificReplacements = {
    '': '📊', // Dashboard icon (specific Unicode)
    '': '📦', // Inventory/Estoque icon (specific Unicode)
    '': '💰', // Sell/Vender icon (specific Unicode)
    '': '📋', // History/Histórico icon (specific Unicode)
    '': '📦', // Product icon (specific Unicode)
    '': '⚠️', // Low stock warning (specific Unicode)
    '': '✅', // OK stock (specific Unicode)
  };
  
  function isNavigationElement(element) {
    // Only process DIV elements with React Native Web classes
    if (element.tagName !== 'DIV') return false;
    
    // Only process elements with React Native Web CSS classes
    const className = element.className || '';
    if (typeof className === 'string' && !className.includes('css-')) return false;
    
    // Only process elements that contain navigation text
    const text = (element.textContent || '').trim();
    if (!text || text.length > 100) return false;
    
    // Only process elements that contain the specific navigation words
    const navWords = ['Dashboard', 'Estoque', 'Vender', 'Histórico', 'Total Produtos', 'Estoque Baixo', 'Estoque OK'];
    return navWords.some(word => text.includes(word));
  }
  
  function replaceSpecificUnicodeCharacters() {
    console.log('🎯 PRECISE ICON FIX: Replacing specific Unicode characters only...');
    
    let replacementsMade = 0;
    
    // Find only navigation elements
    const navElements = Array.from(document.querySelectorAll('div')).filter(isNavigationElement);
    
    console.log(`🎯 PRECISE ICON FIX: Found ${navElements.length} navigation elements`);
    
    navElements.forEach(element => {
      // Skip if already processed
      if (processedElements.has(element)) return;
      
      const originalText = element.textContent || '';
      let newText = originalText;
      
      // Only replace the specific Unicode characters we identified
      Object.keys(specificReplacements).forEach(unicodeChar => {
        if (newText.includes(unicodeChar)) {
          newText = newText.replace(new RegExp(unicodeChar, 'g'), specificReplacements[unicodeChar]);
          replacementsMade++;
        }
      });
      
      // Only update if changes were made
      if (newText !== originalText) {
        element.textContent = newText;
        processedElements.add(element);
        
        console.log(`🎯 PRECISE ICON FIX: Replaced specific Unicode in: "${originalText.substring(0, 30)}..." -> "${newText.substring(0, 30)}..."`);
      }
    });
    
    console.log(`🎯 PRECISE ICON FIX: Made ${replacementsMade} precise replacements`);
  }
  
  function fixDashboardLayoutSafely() {
    console.log('🎯 PRECISE LAYOUT FIX: Fixing dashboard layout safely...');
    
    // Find sales-related elements specifically
    const salesElements = Array.from(document.querySelectorAll('div')).filter(el => {
      const text = (el.textContent || '').trim();
      return text.includes('Vendas por dia') || text.includes('Total vendido') || text.includes('R$');
    });
    
    salesElements.forEach(element => {
      const parent = element.closest('div');
      if (parent && !parent.dataset.layoutFixed) {
        // Safely check className
        const className = parent.className || '';
        const hasCssClass = typeof className === 'string' ? className.includes('css-') : false;
        
        if (hasCssClass) {
          // Apply consistent card styling
          parent.style.minHeight = '200px';
          parent.style.display = 'flex';
          parent.style.flexDirection = 'column';
          parent.style.justifyContent = 'center';
          parent.style.alignItems = 'center';
          parent.style.padding = '20px';
          parent.style.borderRadius = '8px';
          parent.style.backgroundColor = '#ffffff';
          parent.style.border = '1px solid #e5e7eb';
          parent.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          parent.style.margin = '10px';
          parent.style.width = '100%';
          parent.style.maxWidth = '400px';
          parent.dataset.layoutFixed = 'true';
          
          console.log('🎯 PRECISE LAYOUT FIX: Fixed sales card layout');
        }
      }
    });
    
    // Fix chart containers safely
    const svgElements = document.querySelectorAll('svg');
    svgElements.forEach(svg => {
      const container = svg.closest('div');
      if (container && !container.dataset.chartFixed) {
        // Safely check className
        const className = container.className || '';
        const hasCssClass = typeof className === 'string' ? className.includes('css-') : false;
        
        if (hasCssClass) {
          // Ensure chart is properly sized
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '300px';
          
          // Fix parent container
          container.style.width = '100%';
          container.style.minHeight = '250px';
          container.style.display = 'flex';
          container.style.alignItems = 'center';
          container.style.justifyContent = 'center';
          container.style.padding = '20px';
          container.style.backgroundColor = '#ffffff';
          container.style.borderRadius = '8px';
          container.style.border = '1px solid #e5e7eb';
          container.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          container.style.margin = '10px';
          container.dataset.chartFixed = 'true';
          
          console.log('🎯 PRECISE LAYOUT FIX: Fixed chart container layout');
        }
      }
    });
  }
  
  function runPreciseFixes() {
    console.log('🎯 PRECISE ICON FIX: Running precise fixes...');
    
    replaceSpecificUnicodeCharacters();
    fixDashboardLayoutSafely();
    
    console.log('🎯 PRECISE ICON FIX: Precise fixes completed');
  }
  
  // Run fixes after DOM is loaded
  setTimeout(runPreciseFixes, 2000);
  setTimeout(runPreciseFixes, 4000);
  
  // Also run when new content is added (but only once)
  let hasRunOnMutation = false;
  const observer = new MutationObserver((mutations) => {
    if (hasRunOnMutation) return;
    
    let shouldRun = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldRun = true;
        break;
      }
    }
    if (shouldRun) {
      hasRunOnMutation = true;
      setTimeout(runPreciseFixes, 1000);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
})();
