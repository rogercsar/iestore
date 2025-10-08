// Material Icons Unicode Replacement Script
(function() {
  'use strict';
  
  console.log('🎯 MATERIAL ICONS FIX: Starting Unicode replacement...');
  
  // Track processed elements to avoid duplicates
  const processedElements = new Set();
  
  // Mapping of Material Icons Unicode characters to emojis
  const iconReplacements = {
    // Navigation icons (based on the investigation results)
    '': '📊', // Dashboard icon
    '': '📦', // Inventory/Estoque icon  
    '': '💰', // Sell/Vender icon
    '': '📋', // History/Histórico icon
    
    // Product indicators
    '': '📦', // Product icon
    '': '⚠️', // Low stock warning
    '': '✅', // OK stock
    
    // Other common Material Icons
    '': '🏠', // Home
    '': '⚙️', // Settings
    '': '➕', // Add
    '': '✏️', // Edit
    '': '🗑️', // Delete
    '': '🔍', // Search
    '': '💾', // Save
    '': '❌', // Cancel
    '': '☰', // Menu
    '': '✕', // Close
    '': '⬅️', // Back
    '': '➡️', // Forward
    '': '⬆️', // Up
    '': '⬇️', // Down
    '': 'ℹ️', // Info
    '': '❓', // Help
    '': '⭐', // Star
    '': '❤️', // Favorite
    '': '🔔', // Notification
    '': '👤', // User
    '': '🔒', // Lock
    '': '🔓', // Unlock
  };
  
  function replaceInvisibleIcons() {
    console.log('🎯 ICON FIX: Replacing invisible Material Icons...');
    
    let replacementsMade = 0;
    
    // Find all elements with Material Icons font family
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      // Skip if already processed
      if (processedElements.has(element)) return;
      
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;
      
      // Check if element uses Material Icons font
      if (fontFamily.includes('Material Icons') || fontFamily.includes('MaterialIcons')) {
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
          
          console.log(`🎯 ICON FIX: Replaced icons in element: "${originalText}" -> "${newText}"`);
        }
      }
    });
    
    console.log(`🎯 ICON FIX: Made ${replacementsMade} icon replacements`);
  }
  
  function fixDashboardLayout() {
    console.log('🎯 LAYOUT FIX: Fixing dashboard layout...');
    
    // Find sales-related elements and fix their layout
    const salesElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = (el.textContent || '').trim();
      return text.includes('Vendas por dia') || text.includes('Total vendido') || text.includes('R$');
    });
    
    salesElements.forEach(element => {
      const parent = element.closest('div');
      if (parent && !parent.dataset.layoutFixed) {
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
        
        console.log('🎯 LAYOUT FIX: Fixed sales card layout');
      }
    });
    
    // Fix chart containers
    const svgElements = document.querySelectorAll('svg');
    svgElements.forEach(svg => {
      const container = svg.closest('div');
      if (container && !container.dataset.chartFixed) {
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
        
        console.log('🎯 LAYOUT FIX: Fixed chart container layout');
      }
    });
  }
  
  function runFixes() {
    console.log('🎯 MATERIAL ICONS FIX: Running fixes...');
    
    replaceInvisibleIcons();
    fixDashboardLayout();
    
    console.log('🎯 MATERIAL ICONS FIX: Fixes completed');
  }
  
  // Run fixes after DOM is loaded
  setTimeout(runFixes, 1000);
  setTimeout(runFixes, 3000);
  setTimeout(runFixes, 5000);
  
  // Also run when new content is added
  const observer = new MutationObserver((mutations) => {
    let shouldRun = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldRun = true;
        break;
      }
    }
    if (shouldRun) {
      setTimeout(runFixes, 500);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
})();
