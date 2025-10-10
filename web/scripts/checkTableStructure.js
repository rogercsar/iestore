// Script para verificar a estrutura da tabela de produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela de produtos...\n');
    
    // 1. Testar inserção de produto com ID
    console.log('1️⃣ Testando inserção de produto com ID...');
    const testProduct = {
      id: 'test_product_456',
      name: 'Produto Teste 2',
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
      console.log('✅ Produto inserido com sucesso!');
      
      // 2. Verificar se foi inserido
      console.log('\n2️⃣ Verificando se produto foi inserido...');
      const verifyResponse = await fetch(`${API_BASE}?table=products`);
      const verifyProducts = await verifyResponse.json();
      
      console.log(`Total de produtos: ${verifyProducts.length}`);
      
      const testProductFound = verifyProducts.find(p => p.name === 'Produto Teste 2');
      if (testProductFound) {
        console.log('✅ Produto de teste encontrado!');
        console.log(JSON.stringify(testProductFound, null, 2));
        
        if (testProductFound.id) {
          console.log('✅ Produto tem ID!');
        } else {
          console.log('❌ Produto não tem ID!');
        }
      } else {
        console.log('❌ Produto de teste não encontrado!');
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

checkTableStructure();
