// Script para testar a migração da tabela
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function testTableMigration() {
  try {
    console.log('🔄 Testando migração da tabela de produtos...\n');
    
    // 1. Fazer uma chamada GET para forçar a execução da função ensureProductsTable
    console.log('1️⃣ Forçando execução da função ensureProductsTable...');
    const getResponse = await fetch(`${API_BASE}?table=products`);
    
    console.log(`Status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      const products = await getResponse.json();
      console.log(`✅ Produtos retornados: ${products.length}`);
      
      if (products.length > 0) {
        const firstProduct = products[0];
        console.log('\n📋 Primeiro produto:');
        console.log(JSON.stringify(firstProduct, null, 2));
        
        if (firstProduct.id) {
          console.log('\n🎉 SUCESSO! Produtos agora têm IDs!');
          console.log(`   ID do primeiro produto: ${firstProduct.id}`);
          
          // Verificar quantos produtos têm IDs
          const productsWithIds = products.filter(p => p.id);
          const productsWithoutIds = products.filter(p => !p.id);
          
          console.log(`\n📊 Estatísticas:`);
          console.log(`   Produtos com ID: ${productsWithIds.length}`);
          console.log(`   Produtos sem ID: ${productsWithoutIds.length}`);
          
          if (productsWithoutIds.length === 0) {
            console.log('\n✅ Todos os produtos têm IDs!');
          } else {
            console.log('\n⚠️ Ainda há produtos sem ID.');
          }
          
        } else {
          console.log('\n❌ Produtos ainda não têm IDs!');
        }
      }
    } else {
      const errorText = await getResponse.text();
      console.log('❌ Erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testTableMigration();
