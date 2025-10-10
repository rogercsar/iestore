// Script para testar atualização de produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function testProductUpdate() {
  try {
    console.log('🧪 Testando atualização de produtos...\n');
    
    // 1. Buscar produtos existentes
    const productsResponse = await fetch(`${API_BASE}?table=products`);
    const products = await productsResponse.json();
    console.log(`📦 Produtos antes: ${products.length}`);
    
    if (products.length > 0) {
      const productToUpdate = products[0];
      console.log(`✏️ Produto a ser atualizado: ${productToUpdate.name}`);
      console.log(`   Quantidade atual: ${productToUpdate.quantity}`);
      console.log(`   Preço atual: ${productToUpdate.unitPrice}`);
      
      // Simular atualização
      const updatedProduct = {
        ...productToUpdate,
        quantity: productToUpdate.quantity + 10,
        unitPrice: Math.round((productToUpdate.unitPrice + 5) * 100) / 100
      };
      
      console.log(`   Nova quantidade: ${updatedProduct.quantity}`);
      console.log(`   Novo preço: ${updatedProduct.unitPrice}`);
      
      // Encontrar o produto na lista e atualizá-lo
      const updatedProducts = products.map(p => 
        p.name === productToUpdate.name ? updatedProduct : p
      );
      
      // Testar atualização real
      const updateResponse = await fetch(`${API_BASE}?table=products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'overwrite', 
          rows: updatedProducts
        })
      });
      
      console.log(`📡 Status da resposta: ${updateResponse.status}`);
      
      if (updateResponse.ok) {
        // Verificar resultado
        const productsAfterResponse = await fetch(`${API_BASE}?table=products`);
        const productsAfter = await productsAfterResponse.json();
        console.log(`📦 Produtos depois: ${productsAfter.length}`);
        
        // Verificar se o produto foi atualizado
        const updatedProductInDB = productsAfter.find(p => p.name === productToUpdate.name);
        if (updatedProductInDB) {
          console.log(`✅ Produto atualizado encontrado: ${updatedProductInDB.name}`);
          console.log(`   Quantidade: ${updatedProductInDB.quantity} (era ${productToUpdate.quantity})`);
          console.log(`   Preço: ${updatedProductInDB.unitPrice} (era ${productToUpdate.unitPrice})`);
          
          if (updatedProductInDB.quantity === updatedProduct.quantity && 
              Math.abs(updatedProductInDB.unitPrice - updatedProduct.unitPrice) < 0.01) {
            console.log('✅ Atualização funcionou perfeitamente!');
          } else {
            console.log('❌ Atualização falhou - valores não correspondem');
            console.log(`   Esperado: qty=${updatedProduct.quantity}, price=${updatedProduct.unitPrice}`);
            console.log(`   Obtido: qty=${updatedProductInDB.quantity}, price=${updatedProductInDB.unitPrice}`);
          }
        } else {
          console.log('❌ Produto não encontrado após atualização');
        }
      } else {
        const errorText = await updateResponse.text();
        console.log('❌ Erro na atualização:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testProductUpdate();
