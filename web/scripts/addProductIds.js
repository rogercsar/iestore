// Script para adicionar IDs aos produtos existentes
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function addProductIds() {
  try {
    console.log('🔄 Adicionando IDs aos produtos existentes...\n');
    
    // 1. Buscar produtos existentes
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    console.log(`📦 Produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      return;
    }
    
    // 2. Adicionar IDs aos produtos que não têm
    const updatedProducts = products.map(product => {
      if (!product.id) {
        const newId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`🆔 Adicionando ID ${newId} ao produto: ${product.name}`);
        return { ...product, id: newId };
      }
      return product;
    });
    
    // 3. Atualizar produtos no banco
    console.log('\n🔄 Atualizando produtos no banco...');
    const updateResponse = await fetch(`${API_BASE}?table=products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mode: 'overwrite', 
        rows: updatedProducts
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Produtos atualizados com sucesso!');
      
      // 4. Verificar resultado
      const verifyResponse = await fetch(`${API_BASE}?table=products`);
      const verifyProducts = await verifyResponse.json();
      
      console.log(`\n📊 Verificação:`);
      console.log(`   Total de produtos: ${verifyProducts.length}`);
      
      const productsWithIds = verifyProducts.filter(p => p.id);
      const productsWithoutIds = verifyProducts.filter(p => !p.id);
      
      console.log(`   Produtos com ID: ${productsWithIds.length}`);
      console.log(`   Produtos sem ID: ${productsWithoutIds.length}`);
      
      if (productsWithoutIds.length === 0) {
        console.log('\n🎉 Todos os produtos agora têm IDs!');
        
        console.log('\n📋 Exemplos de IDs gerados:');
        verifyProducts.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ID: ${product.id}`);
        });
      } else {
        console.log('\n❌ Ainda há produtos sem ID!');
      }
      
    } else {
      console.log('❌ Erro ao atualizar produtos:', updateResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

addProductIds();
