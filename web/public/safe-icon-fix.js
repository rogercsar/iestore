// Safe Material Icons Replacement Script - Only Navigation Elements
(function() {
  'use strict';
  
  console.log('🎯 SAFE ICON FIX: Starting safe Unicode replacement...');
  
  // Track processed elements to avoid duplicates
  const processedElements = new Set();
  
  // Mapping of Material Icons Unicode characters to emojis
  const iconReplacements = {
    '': '📊', // Dashboard icon
    '': '📦', // Inventory/Estoque icon  
    '': '💰', // Sell/Vender icon
    '': '📋', // History/Histórico icon
    '': '📦', // Product icon
    '': '⚠️', // Low stock warning
    '': '✅', // OK stock
  };
  
  function isSafeElement(element) {
    // Only process DIV elements with React Native Web classes
    if (element.tagName !== 'DIV') return false;
    
    // Skip style, script, and other non-content elements
    if (element.tagName === 'STYLE' || element.tagName === 'SCRIPT' || 
        element.tagName === 'HEAD' || element.tagName === 'META') return false;
    
    // Only process elements with React Native Web CSS classes
    const className = element.className || '';
    if (!className.includes('css-')) return false;
    
    // Only process elements that contain navigation text
    const text = (element.textContent || '').trim();
    if (!text || text.length > 100) return false;
    
    // Only process elements that contain the specific navigation words
    const navWords = ['Dashboard', 'Estoque', 'Vender', 'Histórico', 'Total Produtos', 'Estoque Baixo', 'Estoque OK'];
    return navWords.some(word => text.includes(word));
  }
  
  function replaceNavigationIcons() {
    console.log('🎯 SAFE ICON FIX: Replacing navigation icons only...');
    
    let replacementsMade = 0;
    
    // Find only navigation elements
    const navElements = Array.from(document.querySelectorAll('div')).filter(isSafeElement);
    
    console.log(`🎯 SAFE ICON FIX: Found ${navElements.length} safe navigation elements`);
    
    navElements.forEach(element => {
      // Skip if already processed
      if (processedElements.has(element)) return;
      
      const originalText = element.textContent || '';
      let newText = originalText;
      
      // Replace invisible Unicode characters with emojis
      Object.keys(iconReplacements).forEach(unicodeChar => {
        if (newText.includes(unicodeChar)) {
          newText = newText.replace(new RegExp(unicodeChar, 'g'), iconReplacements[unicodeChar]);
          replacementsMade++;
        }
      });
      
      // Only update if changes were made
      if (newText !== originalText) {
        element.textContent = newText;
        processedElements.add(element);
        
        console.log(`🎯 SAFE ICON FIX: Replaced icons in navigation: "${originalText.substring(0, 50)}..." -> "${newText.substring(0, 50)}..."`);
      }
    });
    
    console.log(`🎯 SAFE ICON FIX: Made ${replacementsMade} safe icon replacements`);
  }
  
  function fixDashboardLayoutOnly() {
    console.log('🎯 SAFE LAYOUT FIX: Fixing dashboard layout only...');
    
    // Find sales-related elements specifically
    const salesElements = Array.from(document.querySelectorAll('div')).filter(el => {
      const text = (el.textContent || '').trim();
      return text.includes('Vendas por dia') || text.includes('Total vendido') || text.includes('R$');
    });
    
    salesElements.forEach(element => {
      const parent = element.closest('div');
      if (parent && !parent.dataset.layoutFixed && parent.className.includes('css-')) {
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
        
        console.log('🎯 SAFE LAYOUT FIX: Fixed sales card layout');
      }
    });
    
    // Fix chart containers
    const svgElements = document.querySelectorAll('svg');
    svgElements.forEach(svg => {
      const container = svg.closest('div');
      if (container && !container.dataset.chartFixed && container.className.includes('css-')) {
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
        
        console.log('🎯 SAFE LAYOUT FIX: Fixed chart container layout');
      }
    });
  }
  
  function runSafeFixes() {
    console.log('🎯 SAFE ICON FIX: Running safe fixes...');
    
    replaceNavigationIcons();
    fixDashboardLayoutOnly();
    
    console.log('🎯 SAFE ICON FIX: Safe fixes completed');
  }
  
  // Run fixes after DOM is loaded
  setTimeout(runSafeFixes, 2000);
  setTimeout(runSafeFixes, 4000);
  
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
      setTimeout(runSafeFixes, 1000);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
})();
