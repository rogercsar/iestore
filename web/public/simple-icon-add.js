// Simple Icon Addition Script - Add visible icons without replacing text
(function() {
  'use strict';
  
  console.log('🎯 SIMPLE ICON ADD: Starting simple icon addition...');
  
  // Track processed elements to avoid duplicates
  const processedElements = new Set();
  
  // Icon mapping for navigation items
  const iconMap = {
    'Dashboard': '📊',
    'Estoque': '📦',
    'Vender': '💰',
    'Histórico': '📋',
    'Total Produtos': '📦',
    'Estoque Baixo': '⚠️',
    'Estoque OK': '✅'
  };
  
  function addIconsToNavigation() {
    console.log('🎯 SIMPLE ICON ADD: Adding icons to navigation...');
    
    let iconsAdded = 0;
    
    // Find navigation elements
    const navElements = Array.from(document.querySelectorAll('div')).filter(el => {
      // Only process DIV elements with React Native Web classes
      if (el.tagName !== 'DIV') return false;
      
      const className = el.className || '';
      if (typeof className === 'string' && !className.includes('css-')) return false;
      
      const text = (el.textContent || '').trim();
      if (!text || text.length > 100) return false;
      
      // Check if this element contains navigation text
      return Object.keys(iconMap).some(key => text.includes(key));
    });
    
    console.log(`🎯 SIMPLE ICON ADD: Found ${navElements.length} navigation elements`);
    
    navElements.forEach(element => {
      // Skip if already processed
      if (processedElements.has(element)) return;
      
      const text = element.textContent || '';
      
      // Find which icon to add
      let iconToAdd = null;
      let textToMatch = null;
      
      for (const [key, icon] of Object.entries(iconMap)) {
        if (text.includes(key)) {
          iconToAdd = icon;
          textToMatch = key;
          break;
        }
      }
      
      if (iconToAdd && textToMatch) {
        // Add icon before the text
        element.innerHTML = `<span style="font-size: 18px; margin-right: 8px; display: inline-block;">${iconToAdd}</span>${text}`;
        processedElements.add(element);
        iconsAdded++;
        
        console.log(`🎯 SIMPLE ICON ADD: Added ${iconToAdd} to "${textToMatch}"`);
      }
    });
    
    console.log(`🎯 SIMPLE ICON ADD: Added ${iconsAdded} icons`);
  }
  
  function fixDashboardLayout() {
    console.log('🎯 SIMPLE LAYOUT FIX: Fixing dashboard layout...');
    
    // Find sales-related elements
    const salesElements = Array.from(document.querySelectorAll('div')).filter(el => {
      const text = (el.textContent || '').trim();
      return text.includes('Vendas por dia') || text.includes('Total vendido') || text.includes('R$');
    });
    
    salesElements.forEach(element => {
      const parent = element.closest('div');
      if (parent && !parent.dataset.layoutFixed) {
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
          
          console.log('🎯 SIMPLE LAYOUT FIX: Fixed sales card layout');
        }
      }
    });
    
    // Fix chart containers
    const svgElements = document.querySelectorAll('svg');
    svgElements.forEach(svg => {
      const container = svg.closest('div');
      if (container && !container.dataset.chartFixed) {
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
          
          console.log('🎯 SIMPLE LAYOUT FIX: Fixed chart container layout');
        }
      }
    });
  }
  
  function runSimpleFixes() {
    console.log('🎯 SIMPLE ICON ADD: Running simple fixes...');
    
    addIconsToNavigation();
    fixDashboardLayout();
    
    console.log('🎯 SIMPLE ICON ADD: Simple fixes completed');
  }
  
  // Run fixes after DOM is loaded
  setTimeout(runSimpleFixes, 2000);
  setTimeout(runSimpleFixes, 4000);
  
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
      setTimeout(runSimpleFixes, 1000);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
})();
