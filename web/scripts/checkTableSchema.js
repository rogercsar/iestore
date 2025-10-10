// Script para verificar o schema da tabela
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkTableSchema() {
  try {
    console.log('🔍 Verificando schema da tabela de produtos...\n');
    
    // 1. Inserir produto com ID explícito
    console.log('1️⃣ Inserindo produto com ID explícito...');
    const testProduct = {
      id: 'test_id_999',
      name: 'Produto Teste ID',
      quantity: 1,
      cost: 10.00,
      unitPrice: 20.00,
      photo: null
    };
    
    const postResponse = await fetch(`${API_BASE}?table=products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'append',
        rows: [testProduct]
      })
    });
    
    console.log(`Status: ${postResponse.status}`);
    
    if (postResponse.ok) {
      console.log('✅ Produto inserido!');
      
      // 2. Verificar se foi inserido
      console.log('\n2️⃣ Verificando se produto foi inserido...');
      const verifyResponse = await fetch(`${API_BASE}?table=products`);
      const verifyProducts = await verifyResponse.json();
      
      const testProductFound = verifyProducts.find(p => p.name === 'Produto Teste ID');
      if (testProductFound) {
        console.log('✅ Produto encontrado!');
        console.log('📋 Estrutura do produto:');
        console.log(JSON.stringify(testProductFound, null, 2));
        
        // Verificar se tem ID
        if (testProductFound.id) {
          console.log('✅ Produto tem ID!');
        } else {
          console.log('❌ Produto não tem ID!');
          console.log('💡 Isso indica que a tabela não tem o campo ID ou a consulta não está retornando ele.');
        }
      } else {
        console.log('❌ Produto não encontrado!');
      }
      
    } else {
      const errorText = await postResponse.text();
      console.log('❌ Erro na inserção:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkTableSchema();