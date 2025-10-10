// Script para adicionar coluna ID e popular automaticamente
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function addIdColumnAndPopulate() {
  try {
    console.log('🔄 Adicionando coluna ID e populando automaticamente...\n');
    
    // 1. Buscar produtos existentes
    console.log('1️⃣ Buscando produtos existentes...');
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    console.log(`📦 Produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      return;
    }
    
    // 2. Criar novos produtos com IDs únicos
    console.log('\n2️⃣ Gerando IDs únicos para todos os produtos...');
    const productsWithIds = products.map((product, index) => {
      const uniqueId = `product_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
      console.log(`   ${index + 1}. ${product.name} → ID: ${uniqueId}`);
      return {
        ...product,
        id: uniqueId
      };
    });
    
    // 3. Substituir todos os produtos (isso vai recriar a tabela com a nova estrutura)
    console.log('\n3️⃣ Atualizando tabela com nova estrutura...');
    const updateResponse = await fetch(`${API_BASE}?table=products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mode: 'overwrite', 
        rows: productsWithIds
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Tabela atualizada com sucesso!');
      
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
        console.log('\n🎉 Sucesso! Todos os produtos agora têm IDs!');
        
        console.log('\n📋 Exemplos de produtos com IDs:');
        verifyProducts.slice(0, 5).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name}`);
          console.log(`      ID: ${product.id}`);
          console.log(`      Preço: R$ ${product.unitPrice}`);
          console.log(`      Estoque: ${product.quantity}`);
          console.log('');
        });
        
        console.log('✅ Migração concluída com sucesso!');
        console.log('💡 Agora todos os produtos têm IDs únicos e podem ser referenciados por ID.');
        
      } else {
        console.log('\n❌ Ainda há produtos sem ID!');
        console.log('💡 Pode ser necessário executar o script novamente.');
      }
      
    } else {
      console.log('❌ Erro ao atualizar tabela:', updateResponse.status);
      const errorText = await updateResponse.text();
      console.log('Detalhes do erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

addIdColumnAndPopulate();
