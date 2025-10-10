// Script para debugar exclusão de produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function debugDelete() {
  try {
    console.log('🔍 Debugando exclusão de produtos...\n');
    
    // 1. Buscar produtos existentes
    const productsResponse = await fetch(`${API_BASE}?table=products`);
    const products = await productsResponse.json();
    console.log(`📦 Produtos antes: ${products.length}`);
    console.log('📋 Primeiros 3 produtos:');
    products.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (ID: ${p.id})`);
    });
    
    if (products.length > 0) {
      const productToDelete = products[0];
      console.log(`\n🗑️ Produto a ser excluído: ${productToDelete.name} (ID: ${productToDelete.id})`);
      
      // Filtrar produtos (simular o que a API faz)
      const filteredProducts = products.filter(p => p.id !== productToDelete.id);
      console.log(`📦 Produtos após filtro: ${filteredProducts.length}`);
      console.log('📋 Produtos restantes:');
      filteredProducts.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (ID: ${p.id})`);
      });
      
      // Verificar se o produto foi removido do filtro
      const productStillExists = filteredProducts.find(p => p.id === productToDelete.id);
      if (productStillExists) {
        console.log('❌ PROBLEMA: Produto ainda está na lista filtrada!');
      } else {
        console.log('✅ Produto foi removido da lista filtrada corretamente');
      }
      
      // Testar exclusão real
      console.log('\n🔄 Testando exclusão real...');
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
          console.log('✅ Exclusão funcionou corretamente!');
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
    console.error('❌ Erro no debug:', error.message);
  }
}

debugDelete();
