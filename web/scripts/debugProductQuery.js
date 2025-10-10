// Script para debugar a consulta de produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function debugProductQuery() {
  try {
    console.log('🔍 Debugando consulta de produtos...\n');
    
    // 1. Inserir produto de teste com ID
    console.log('1️⃣ Inserindo produto de teste com ID...');
    const testProduct = {
      id: 'debug_test_123',
      name: 'Produto Debug',
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
      
      const testProductFound = verifyProducts.find(p => p.name === 'Produto Debug');
      if (testProductFound) {
        console.log('✅ Produto encontrado!');
        console.log('📋 Estrutura do produto:');
        console.log(JSON.stringify(testProductFound, null, 2));
        
        // Verificar se tem ID
        if (testProductFound.id) {
          console.log('✅ Produto tem ID!');
        } else {
          console.log('❌ Produto não tem ID!');
          console.log('💡 Isso indica que a consulta SELECT não está retornando o campo ID.');
        }
      } else {
        console.log('❌ Produto não encontrado!');
      }
      
      // 3. Verificar todos os produtos
      console.log('\n3️⃣ Verificando todos os produtos...');
      const productsWithIds = verifyProducts.filter(p => p.id);
      const productsWithoutIds = verifyProducts.filter(p => !p.id);
      
      console.log(`   Produtos com ID: ${productsWithIds.length}`);
      console.log(`   Produtos sem ID: ${productsWithoutIds.length}`);
      
      if (productsWithIds.length > 0) {
        console.log('\n📋 Exemplos de produtos com ID:');
        productsWithIds.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ID: ${product.id}`);
        });
      }
      
    } else {
      const errorText = await postResponse.text();
      console.log('❌ Erro na inserção:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugProductQuery();
