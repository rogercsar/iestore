// Font Test Script - Test if fonts are working correctly
(function() {
  'use strict';
  
  console.log('🧪 FONT TEST: Testing font loading and rendering...');
  
  function testFonts() {
    console.log('🧪 FONT TEST: Starting comprehensive font tests...');
    
    // 1. Test Material Icons font loading
    console.log('🧪 FONT TEST: Testing Material Icons...');
    
    const testMaterialIcons = document.createElement('div');
    testMaterialIcons.style.fontFamily = 'Material Icons';
    testMaterialIcons.style.fontSize = '48px';
    testMaterialIcons.textContent = 'home';
    testMaterialIcons.style.position = 'absolute';
    testMaterialIcons.style.left = '-9999px';
    testMaterialIcons.style.top = '-9999px';
    testMaterialIcons.id = 'test-material-icons';
    document.body.appendChild(testMaterialIcons);
    
    setTimeout(() => {
      const materialIconsStyle = window.getComputedStyle(testMaterialIcons);
      const materialIconsRect = testMaterialIcons.getBoundingClientRect();
      
      console.log('🧪 FONT TEST: Material Icons test results:', {
        requestedFont: 'Material Icons',
        computedFont: materialIconsStyle.fontFamily,
        fontSize: materialIconsStyle.fontSize,
        width: materialIconsRect.width,
        height: materialIconsRect.height,
        isLoaded: materialIconsStyle.fontFamily.includes('Material Icons'),
        isRendering: materialIconsRect.width > 0 && materialIconsRect.height > 0
      });
      
      // Test if the icon is actually rendering (not just showing text)
      const isIconRendering = materialIconsRect.width < 100 && materialIconsRect.height < 100;
      console.log('🧪 FONT TEST: Material Icons rendering correctly:', isIconRendering);
      
      document.body.removeChild(testMaterialIcons);
    }, 1000);
    
    // 2. Test system fonts
    console.log('🧪 FONT TEST: Testing system fonts...');
    
    const testSystemFont = document.createElement('div');
    testSystemFont.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif';
    testSystemFont.style.fontSize = '16px';
    testSystemFont.textContent = 'Test text for system fonts';
    testSystemFont.style.position = 'absolute';
    testSystemFont.style.left = '-9999px';
    testSystemFont.style.top = '-9999px';
    testSystemFont.id = 'test-system-font';
    document.body.appendChild(testSystemFont);
    
    setTimeout(() => {
      const systemFontStyle = window.getComputedStyle(testSystemFont);
      const systemFontRect = testSystemFont.getBoundingClientRect();
      
      console.log('🧪 FONT TEST: System font test results:', {
        requestedFont: 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
        computedFont: systemFontStyle.fontFamily,
        fontSize: systemFontStyle.fontSize,
        width: systemFontRect.width,
        height: systemFontRect.height,
        isRendering: systemFontRect.width > 0 && systemFontRect.height > 0
      });
      
      document.body.removeChild(testSystemFont);
    }, 1000);
    
    // 3. Test font loading status
    console.log('🧪 FONT TEST: Checking font loading status...');
    
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        console.log('🧪 FONT TEST: All fonts loaded successfully');
        
        // Check specific fonts
        const materialIconsFont = document.fonts.check('16px Material Icons');
        const systemFont = document.fonts.check('16px system-ui');
        
        console.log('🧪 FONT TEST: Font availability:', {
          'Material Icons': materialIconsFont,
          'System UI': systemFont
        });
      });
    } else {
      console.log('🧪 FONT TEST: document.fonts not available');
    }
    
    // 4. Test actual app elements
    console.log('🧪 FONT TEST: Testing actual app elements...');
    
    const appElements = document.querySelectorAll('*');
    let textElements = 0;
    let iconElements = 0;
    let problematicElements = 0;
    
    appElements.forEach(element => {
      const text = (element.textContent || element.innerText || '').trim();
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;
      
      if (text.length > 0 && text.length < 100) {
        textElements++;
        
        // Check if text element is using icon font (problematic)
        if (fontFamily.includes('Material Icons') && !element.className.includes('icon')) {
          problematicElements++;
          console.log('🧪 FONT TEST: Problematic element found:', {
            text: text.substring(0, 30),
            tagName: element.tagName,
            className: element.className,
            fontFamily: fontFamily
          });
        }
      }
      
      // Check for icon elements
      if (element.className.includes('icon') || element.className.includes('material') || element.className.includes('ion')) {
        iconElements++;
      }
    });
    
    console.log('🧪 FONT TEST: App elements analysis:', {
      totalElements: appElements.length,
      textElements: textElements,
      iconElements: iconElements,
      problematicElements: problematicElements
    });
    
    // 5. Test font URLs
    console.log('🧪 FONT TEST: Testing font URLs...');
    
    const fontUrls = [
      '/assets/fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf',
      '/assets/fonts/MaterialCommunityIcons.b62641afc9ab487008e996a5c5865e56.ttf',
      '/assets/fonts/Ionicons.6148e7019854f3bde85b633cb88f3c25.ttf'
    ];
    
    fontUrls.forEach(url => {
      fetch(url, { method: 'HEAD' })
        .then(response => {
          console.log(`🧪 FONT TEST: Font URL ${url}:`, {
            status: response.status,
            statusText: response.statusText,
            available: response.ok
          });
        })
        .catch(error => {
          console.log(`🧪 FONT TEST: Font URL ${url} error:`, error);
        });
    });
  }
  
  // Run tests with delays
  setTimeout(testFonts, 1000);
  setTimeout(testFonts, 3000);
  
})();
