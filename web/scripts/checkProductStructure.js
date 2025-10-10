// Script para verificar a estrutura dos produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkProductStructure() {
  try {
    console.log('🔍 Verificando estrutura dos produtos...\n');
    
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('📦 Primeiro produto:');
      console.log(JSON.stringify(firstProduct, null, 2));
      
      console.log('\n🔑 Chaves do objeto:');
      Object.keys(firstProduct).forEach(key => {
        console.log(`   - ${key}: ${typeof firstProduct[key]}`);
      });
      
      console.log('\n📊 Análise:');
      console.log(`   Tem campo 'id': ${firstProduct.hasOwnProperty('id')}`);
      console.log(`   Valor do 'id': ${firstProduct.id || 'UNDEFINED'}`);
    } else {
      console.log('❌ Nenhum produto encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkProductStructure();
