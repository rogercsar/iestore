// Script para testar exclusão de produtos por nome
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function testProductDelete() {
  try {
    console.log('🧪 Testando exclusão de produtos por nome...\n');
    
    // 1. Buscar produtos existentes
    const productsResponse = await fetch(`${API_BASE}?table=products`);
    const products = await productsResponse.json();
    console.log(`📦 Produtos antes: ${products.length}`);
    
    if (products.length > 0) {
      const productToDelete = products[0];
      console.log(`🗑️ Excluindo produto: ${productToDelete.name}`);
      
      // Filtrar produtos por nome
      const filteredProducts = products.filter(p => p.name !== productToDelete.name);
      console.log(`📦 Produtos após filtro: ${filteredProducts.length}`);
      
      // Testar exclusão real
      const deleteResponse = await fetch(`${API_BASE}?table=products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'overwrite', 
          rows: filteredProducts
        })
      });
      
      console.log(`📡 Status da resposta: ${deleteResponse.status}`);
      
      if (deleteResponse.ok) {
        // Verificar resultado
        const productsAfterResponse = await fetch(`${API_BASE}?table=products`);
        const productsAfter = await productsAfterResponse.json();
        console.log(`📦 Produtos depois: ${productsAfter.length}`);
        
        if (productsAfter.length === products.length - 1) {
          console.log('✅ Exclusão de produto funcionou!');
          
          // Verificar se o produto específico foi removido
          const productStillExists = productsAfter.find(p => p.name === productToDelete.name);
          if (productStillExists) {
            console.log('❌ PROBLEMA: Produto ainda existe na lista!');
          } else {
            console.log('✅ Produto foi removido corretamente!');
          }
        } else {
          console.log('❌ Exclusão falhou - número incorreto de produtos');
          console.log(`Esperado: ${products.length - 1}, Obtido: ${productsAfter.length}`);
        }
      } else {
        const errorText = await deleteResponse.text();
        console.log('❌ Erro na exclusão:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testProductDelete();
