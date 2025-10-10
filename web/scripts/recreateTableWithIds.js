// Script para recriar a tabela com IDs e adicionar todos os produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function recreateTableWithIds() {
  try {
    console.log('🔄 Recriando tabela de produtos com IDs...\n');
    
    // 1. Buscar todos os produtos existentes
    console.log('1️⃣ Buscando produtos existentes...');
    const getResponse = await fetch(`${API_BASE}?table=products`);
    const existingProducts = await getResponse.json();
    
    console.log(`📦 Produtos encontrados: ${existingProducts.length}`);
    
    if (existingProducts.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      return;
    }
    
    // 2. Criar novos produtos com IDs únicos
    console.log('\n2️⃣ Criando produtos com IDs únicos...');
    const productsWithIds = existingProducts.map((product, index) => {
      const uniqueId = `product_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
      console.log(`   ${index + 1}. ${product.name} → ID: ${uniqueId}`);
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
    
    // 3. Substituir todos os produtos (isso vai recriar a tabela com a nova estrutura)
    console.log('\n3️⃣ Recriando tabela com nova estrutura...');
    const updateResponse = await fetch(`${API_BASE}?table=products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mode: 'overwrite', 
        rows: productsWithIds
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Tabela recriada com sucesso!');
      
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
        console.log('\n🎉 SUCESSO! Tabela recriada com IDs!');
        
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
      console.log('❌ Erro ao recriar tabela:', updateResponse.status);
      const errorText = await updateResponse.text();
      console.log('Detalhes do erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

recreateTableWithIds();
