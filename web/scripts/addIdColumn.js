// Script para adicionar coluna ID na tabela de produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function addIdColumn() {
  try {
    console.log('🔧 Adicionando coluna ID na tabela de produtos...\n');
    
    // 1. Buscar produtos existentes
    console.log('1️⃣ Buscando produtos existentes...');
    const getResponse = await fetch(`${API_BASE}?table=products`);
    const products = await getResponse.json();
    
    console.log(`📦 Produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      return;
    }
    
    // 2. Criar novos produtos com IDs
    console.log('\n2️⃣ Gerando IDs para produtos existentes...');
    const productsWithIds = products.map(product => ({
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: product.name,
      quantity: product.quantity,
      cost: product.cost,
      unitPrice: product.unitPrice,
      photo: product.photo
    }));
    
    console.log('🆔 IDs gerados:');
    productsWithIds.slice(0, 3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ID: ${product.id}`);
    });
    
    // 3. Substituir todos os produtos pelos novos com IDs
    console.log('\n3️⃣ Substituindo produtos na tabela...');
    const updateResponse = await fetch(`${API_BASE}?table=products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mode: 'overwrite', 
        rows: productsWithIds
      })
    });
    
    console.log(`Status: ${updateResponse.status}`);
    
    if (updateResponse.ok) {
      console.log('✅ Produtos atualizados com sucesso!');
      
      // 4. Verificar resultado
      console.log('\n4️⃣ Verificando resultado...');
      const verifyResponse = await fetch(`${API_BASE}?table=products`);
      const verifyProducts = await verifyResponse.json();
      
      console.log(`📊 Total de produtos: ${verifyProducts.length}`);
      
      const productsWithIds = verifyProducts.filter(p => p.id);
      const productsWithoutIds = verifyProducts.filter(p => !p.id);
      
      console.log(`   Produtos com ID: ${productsWithIds.length}`);
      console.log(`   Produtos sem ID: ${productsWithoutIds.length}`);
      
      if (productsWithIds.length > 0) {
        console.log('\n🎉 Sucesso! Produtos agora têm IDs!');
        
        console.log('\n📋 Exemplos de produtos com ID:');
        productsWithIds.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ID: ${product.id}`);
        });
        
        console.log('\n✅ A tabela agora tem o campo ID!');
        console.log('💡 Agora você pode usar IDs para referenciar produtos.');
        
      } else {
        console.log('\n❌ Ainda há produtos sem ID!');
        console.log('💡 Pode ser necessário recriar a tabela com a nova estrutura.');
      }
      
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Erro ao atualizar produtos:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

addIdColumn();
