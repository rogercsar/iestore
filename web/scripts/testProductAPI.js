// Script para testar a API de produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function testProductAPI() {
  try {
    console.log('🧪 Testando API de produtos...\n');
    
    // 1. Testar GET
    console.log('1️⃣ Testando GET /products...');
    const getResponse = await fetch(`${API_BASE}?table=products`);
    console.log(`Status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      const products = await getResponse.json();
      console.log(`Produtos retornados: ${products.length}`);
      
      if (products.length > 0) {
        console.log('Primeiro produto:');
        console.log(JSON.stringify(products[0], null, 2));
      }
    } else {
      const errorText = await getResponse.text();
      console.log('Erro:', errorText);
    }
    
    // 2. Testar POST com produto de teste
    console.log('\n2️⃣ Testando POST /products...');
    const testProduct = {
      id: 'test_product_123',
      name: 'Produto Teste',
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
      const result = await postResponse.json();
      console.log('Resultado:', JSON.stringify(result, null, 2));
      
      // 3. Verificar se foi inserido
      console.log('\n3️⃣ Verificando se produto foi inserido...');
      const verifyResponse = await fetch(`${API_BASE}?table=products`);
      const verifyProducts = await verifyResponse.json();
      
      const testProductFound = verifyProducts.find(p => p.id === 'test_product_123');
      if (testProductFound) {
        console.log('✅ Produto de teste encontrado!');
        console.log(JSON.stringify(testProductFound, null, 2));
      } else {
        console.log('❌ Produto de teste não encontrado!');
      }
    } else {
      const errorText = await postResponse.text();
      console.log('Erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testProductAPI();
