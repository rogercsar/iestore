// Script para migrar produtos para a nova estrutura com IDs
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function migrateProducts() {
  try {
    console.log('🔄 Migrando produtos para nova estrutura com IDs...\n');
    
    // 1. Buscar produtos existentes
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    console.log(`📦 Produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      return;
    }
    
    // 2. Criar novos produtos com IDs
    const newProducts = products.map(product => ({
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: product.name,
      quantity: product.quantity,
      cost: product.cost,
      unitPrice: product.unitPrice,
      photo: product.photo
    }));
    
    console.log('\n🆔 IDs gerados:');
    newProducts.slice(0, 3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ID: ${product.id}`);
    });
    
    // 3. Limpar tabela e inserir novos produtos
    console.log('\n🔄 Limpando tabela e inserindo novos produtos...');
    const updateResponse = await fetch(`${API_BASE}?table=products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mode: 'overwrite', 
        rows: newProducts
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Migração concluída com sucesso!');
      
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
        console.log('\n🎉 Migração bem-sucedida! Todos os produtos têm IDs!');
        
        console.log('\n📋 Exemplos de produtos migrados:');
        verifyProducts.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ID: ${product.id}`);
        });
      } else {
        console.log('\n❌ Ainda há produtos sem ID!');
      }
      
    } else {
      console.log('❌ Erro na migração:', updateResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

migrateProducts();
