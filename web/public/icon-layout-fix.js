// Icon and Layout Fix Script for React Native Web App
(function() {
  'use strict';
  
  console.log('🔧 ICON & LAYOUT FIX: Starting fixes...');
  
  // Icon mapping
  const iconMap = {
    // Navigation
    'Dashboard': '📊',
    'Estoque': '📦', 
    'Vender': '💰',
    'Histórico': '📋',
    'Settings': '⚙️',
    
    // Actions
    'Adicionar': '➕',
    'Editar': '✏️',
    'Excluir': '🗑️',
    'Salvar': '💾',
    'Cancelar': '❌',
    'Buscar': '🔍',
    'Menu': '☰',
    'Fechar': '✕',
    
    // Business
    'Vendas': '💰',
    'Produtos': '📦',
    'Clientes': '👥',
    'Relatórios': '📊',
    'Gráficos': '📈',
    
    // Status
    'Sucesso': '✅',
    'Erro': '❌',
    'Aviso': '⚠️',
    'Info': 'ℹ️'
  };
  
  function applyIconsToElements() {
    console.log('🔧 ICON FIX: Applying icons to elements...');
    
    let iconsApplied = 0;
    
    // Find all text elements
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      
      // Skip if no text or too much text
      if (!text || text.length > 50) return;
      
      // Check if text matches an icon
      if (iconMap[text]) {
        const icon = iconMap[text];
        
        // Apply icon before text
        element.innerHTML = `<span class="icon" style="font-size: 18px; margin-right: 8px;">${icon}</span>${text}`;
        iconsApplied++;
        
        console.log(`🔧 ICON FIX: Applied icon ${icon} to "${text}"`);
      }
      
      // Check for common icon patterns
      const iconPatterns = [
        { pattern: /dashboard/i, icon: '📊' },
        { pattern: /estoque|inventory/i, icon: '📦' },
        { pattern: /vender|sell/i, icon: '💰' },
        { pattern: /histórico|history/i, icon: '📋' },
        { pattern: /configurações|settings/i, icon: '⚙️' },
        { pattern: /adicionar|add/i, icon: '➕' },
        { pattern: /editar|edit/i, icon: '✏️' },
        { pattern: /excluir|delete/i, icon: '🗑️' },
        { pattern: /salvar|save/i, icon: '💾' },
        { pattern: /buscar|search/i, icon: '🔍' },
        { pattern: /menu/i, icon: '☰' },
        { pattern: /fechar|close/i, icon: '✕' },
        { pattern: /vendas|sales/i, icon: '💰' },
        { pattern: /produtos|products/i, icon: '📦' },
        { pattern: /clientes|customers/i, icon: '👥' },
        { pattern: /relatórios|reports/i, icon: '📊' },
        { pattern: /gráficos|charts/i, icon: '📈' }
      ];
      
      iconPatterns.forEach(({ pattern, icon }) => {
        if (pattern.test(text) && !element.innerHTML.includes(icon)) {
          element.innerHTML = `<span class="icon" style="font-size: 18px; margin-right: 8px;">${icon}</span>${text}`;
          iconsApplied++;
          
          console.log(`🔧 ICON FIX: Applied pattern icon ${icon} to "${text}"`);
        }
      });
    });
    
    console.log(`🔧 ICON FIX: Applied ${iconsApplied} icons`);
  }
  
  function fixDashboardLayout() {
    console.log('🔧 LAYOUT FIX: Fixing dashboard layout...');
    
    // Find dashboard elements
    const dashboardElements = document.querySelectorAll('*');
    
    dashboardElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      
      // Fix sales card layout
      if (text.includes('Vendas por dia') || text.includes('Total vendido')) {
        const parent = element.closest('div');
        if (parent) {
          // Ensure proper sizing
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
          
          console.log('🔧 LAYOUT FIX: Fixed sales card layout');
        }
      }
      
      // Fix chart container
      if (element.tagName === 'svg' || element.querySelector('svg')) {
        const svg = element.tagName === 'svg' ? element : element.querySelector('svg');
        if (svg) {
          // Ensure chart is properly sized
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '300px';
          
          // Fix parent container
          const container = svg.closest('div');
          if (container) {
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
            
            console.log('🔧 LAYOUT FIX: Fixed chart container layout');
          }
        }
      }
    });
    
    // Fix overall dashboard layout
    const dashboardContainer = document.querySelector('[class*="dashboard"], [class*="Dashboard"]') || 
                               Array.from(document.querySelectorAll('*')).find(el => 
                                 (el.textContent || '').includes('Dashboard')
                               );
    
    if (dashboardContainer) {
      dashboardContainer.style.display = 'grid';
      dashboardContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
      dashboardContainer.style.gap = '20px';
      dashboardContainer.style.padding = '20px';
      dashboardContainer.style.maxWidth = '1200px';
      dashboardContainer.style.margin = '0 auto';
      
      console.log('🔧 LAYOUT FIX: Fixed dashboard grid layout');
    }
  }
  
  function applyGeneralStyling() {
    console.log('🔧 STYLING FIX: Applying general styling...');
    
    // Fix button styling
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.style.fontFamily = 'inherit';
      button.style.fontSize = '14px';
      button.style.padding = '8px 16px';
      button.style.border = '1px solid #d1d5db';
      button.style.borderRadius = '6px';
      button.style.backgroundColor = '#ffffff';
      button.style.color = '#374151';
      button.style.cursor = 'pointer';
      button.style.transition = 'all 0.2s ease';
    });
    
    // Fix input styling
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.style.fontFamily = 'inherit';
      input.style.fontSize = '14px';
      input.style.padding = '8px 12px';
      input.style.border = '1px solid #d1d5db';
      input.style.borderRadius = '6px';
      input.style.backgroundColor = '#ffffff';
      input.style.color = '#374151';
      input.style.width = '100%';
      input.style.maxWidth = '100%';
    });
    
    // Fix card styling
    const cards = document.querySelectorAll('div');
    cards.forEach(card => {
      const text = (card.textContent || '').trim();
      if (text.length > 10 && text.length < 200 && !card.querySelector('svg')) {
        // Likely a card element
        card.style.backgroundColor = '#ffffff';
        card.style.border = '1px solid #e5e7eb';
        card.style.borderRadius = '8px';
        card.style.padding = '16px';
        card.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        card.style.margin = '8px';
      }
    });
    
    console.log('🔧 STYLING FIX: Applied general styling');
  }
  
  function runFixes() {
    console.log('🔧 FIXES: Running all fixes...');
    
    applyIconsToElements();
    fixDashboardLayout();
    applyGeneralStyling();
    
    console.log('🔧 FIXES: All fixes completed');
  }
  
  // Run fixes with delays
  setTimeout(runFixes, 1000);
  setTimeout(runFixes, 3000);
  setTimeout(runFixes, 5000);
  
  // Watch for DOM changes
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      let shouldReapply = false;
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldReapply = true;
        }
      });
      
      if (shouldReapply) {
        setTimeout(runFixes, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
})();
