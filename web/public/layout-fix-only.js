// Simple Dashboard Layout Fix - Only Layout, No Icons
(function() {
  'use strict';
  
  console.log('🔧 LAYOUT FIX: Starting dashboard layout fix...');
  
  function fixDashboardLayoutOnly() {
    console.log('🔧 LAYOUT FIX: Fixing dashboard layout only...');
    
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
          
          console.log('🔧 LAYOUT FIX: Fixed sales card layout');
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
          
          console.log('🔧 LAYOUT FIX: Fixed chart container layout');
        }
      }
    });
  }
  
  function runLayoutFix() {
    console.log('🔧 LAYOUT FIX: Running layout fix...');
    
    fixDashboardLayoutOnly();
    
    console.log('🔧 LAYOUT FIX: Layout fix completed');
  }
  
  // Run fix after DOM is loaded
  setTimeout(runLayoutFix, 2000);
  setTimeout(runLayoutFix, 4000);
  
})();
