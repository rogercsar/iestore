// Smart Icon and Layout Fix Script - Fixed Version
(function() {
  'use strict';
  
  console.log('🔧 SMART ICON & LAYOUT FIX: Starting smart fixes...');
  
  // Track processed elements to avoid duplicates
  const processedElements = new Set();
  
  // Icon mapping
  const iconMap = {
    'Dashboard': '📊',
    'Estoque': '📦', 
    'Vender': '💰',
    'Histórico': '📋',
    'Settings': '⚙️',
    'Adicionar': '➕',
    'Editar': '✏️',
    'Excluir': '🗑️',
    'Salvar': '💾',
    'Cancelar': '❌',
    'Buscar': '🔍',
    'Menu': '☰',
    'Fechar': '✕'
  };
  
  function applyIconsSmartly() {
    console.log('🔧 SMART ICON FIX: Applying icons smartly...');
    
    let iconsApplied = 0;
    
    // Find navigation elements specifically
    const navElements = document.querySelectorAll('a, button, [role="button"]');
    
    navElements.forEach(element => {
      // Skip if already processed
      if (processedElements.has(element)) return;
      
      const text = (element.textContent || element.innerText || '').trim();
      
      // Skip if no text or too much text
      if (!text || text.length > 50) return;
      
      // Skip if already has an icon
      if (element.innerHTML.includes('📊') || element.innerHTML.includes('📦') || 
          element.innerHTML.includes('💰') || element.innerHTML.includes('📋')) return;
      
      // Check for exact matches first
      if (iconMap[text]) {
        const icon = iconMap[text];
        element.innerHTML = `<span style="font-size: 18px; margin-right: 8px;">${icon}</span>${text}`;
        processedElements.add(element);
        iconsApplied++;
        
        console.log(`🔧 SMART ICON FIX: Applied icon ${icon} to "${text}"`);
        return;
      }
      
      // Check for navigation patterns
      const navPatterns = [
        { pattern: /^Dashboard$/i, icon: '📊' },
        { pattern: /^Estoque$/i, icon: '📦' },
        { pattern: /^Vender$/i, icon: '💰' },
        { pattern: /^Histórico$/i, icon: '📋' }
      ];
      
      navPatterns.forEach(({ pattern, icon }) => {
        if (pattern.test(text)) {
          element.innerHTML = `<span style="font-size: 18px; margin-right: 8px;">${icon}</span>${text}`;
          processedElements.add(element);
          iconsApplied++;
          
          console.log(`🔧 SMART ICON FIX: Applied nav icon ${icon} to "${text}"`);
        }
      });
    });
    
    console.log(`🔧 SMART ICON FIX: Applied ${iconsApplied} icons`);
  }
  
  function fixDashboardLayoutOnly() {
    console.log('🔧 SMART LAYOUT FIX: Fixing dashboard layout only...');
    
    // Find and fix sales card specifically
    const salesElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = (el.textContent || '').trim();
      return text.includes('Vendas por dia') || text.includes('Total vendido');
    });
    
    salesElements.forEach(element => {
      const parent = element.closest('div');
      if (parent && !parent.dataset.layoutFixed) {
        // Fix sales card layout
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
        parent.dataset.layoutFixed = 'true';
        
        console.log('🔧 SMART LAYOUT FIX: Fixed sales card layout');
      }
    });
    
    // Fix chart container specifically
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
        
        console.log('🔧 SMART LAYOUT FIX: Fixed chart container layout');
      }
    });
  }
  
  function applyMinimalStyling() {
    console.log('🔧 MINIMAL STYLING: Applying minimal styling...');
    
    // Only fix buttons that don't have proper styling
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.style.padding) {
        button.style.fontFamily = 'inherit';
        button.style.fontSize = '14px';
        button.style.padding = '8px 16px';
        button.style.border = '1px solid #d1d5db';
        button.style.borderRadius = '6px';
        button.style.backgroundColor = '#ffffff';
        button.style.color = '#374151';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';
      }
    });
    
    console.log('🔧 MINIMAL STYLING: Applied minimal styling');
  }
  
  function runSmartFixes() {
    console.log('🔧 SMART FIXES: Running smart fixes...');
    
    applyIconsSmartly();
    fixDashboardLayoutOnly();
    applyMinimalStyling();
    
    console.log('🔧 SMART FIXES: Smart fixes completed');
  }
  
  // Run fixes only once after app loads
  setTimeout(runSmartFixes, 2000);
  
  // Run once more after a longer delay to catch any late-loading content
  setTimeout(runSmartFixes, 5000);
  
})();
