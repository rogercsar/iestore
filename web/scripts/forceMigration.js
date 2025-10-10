// Script para forçar a migração da tabela
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function forceMigration() {
  try {
    console.log('🔄 Forçando migração da tabela de produtos...\n');
    
    // 1. Buscar produtos existentes
    console.log('1️⃣ Buscando produtos existentes...');
    const getResponse = await fetch(`${API_BASE}?table=products`);
    const products = await getResponse.json();
    
    console.log(`📦 Produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      return;
    }
    
    // 2. Criar novos produtos com IDs únicos
    console.log('\n2️⃣ Criando produtos com IDs únicos...');
    const productsWithIds = products.map((product, index) => {
      const uniqueId = `product_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
      return {
        id: uniqueId,
        name: product.name,
        quantity: product.quantity,
        cost: product.cost,
        unitPrice: product.unitPrice,
        photo: product.photo
      };
    });
    
    console.log(`✅ ${productsWithIds.length} produtos com IDs criados`);
    
    // 3. Substituir todos os produtos
    console.log('\n3️⃣ Substituindo todos os produtos...');
    const updateResponse = await fetch(`${API_BASE}?table=products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mode: 'overwrite', 
        rows: productsWithIds
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Produtos substituídos com sucesso!');
      
      // 4. Verificar resultado
      console.log('\n4️⃣ Verificando resultado...');
      const verifyResponse = await fetch(`${API_BASE}?table=products`);
      const verifyProducts = await verifyResponse.json();
      
      console.log(`📊 Verificação:`);
      console.log(`   Total de produtos: ${verifyProducts.length}`);
      
      const productsWithIds = verifyProducts.filter(p => p.id);
      const productsWithoutIds = verifyProducts.filter(p => !p.id);
      
      console.log(`   Produtos com ID: ${productsWithIds.length}`);
      console.log(`   Produtos sem ID: ${productsWithoutIds.length}`);
      
      if (productsWithoutIds.length === 0) {
        console.log('\n🎉 SUCESSO! Todos os produtos agora têm IDs!');
        
        console.log('\n📋 Exemplos de produtos com IDs:');
        verifyProducts.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name}`);
          console.log(`      ID: ${product.id}`);
          console.log(`      Preço: R$ ${product.unitPrice}`);
          console.log(`      Estoque: ${product.quantity}`);
          console.log('');
        });
        
      } else {
        console.log('\n❌ Ainda há produtos sem ID!');
      }
      
    } else {
      console.log('❌ Erro ao substituir produtos:', updateResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

forceMigration();
