// Script para verificar IDs dos produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkProductIds() {
  try {
    console.log('🔍 Verificando IDs dos produtos...\n');
    
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    console.log(`📦 Total de produtos: ${products.length}\n`);
    
    console.log('📋 Detalhes dos primeiros 5 produtos:');
    products.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. Nome: ${product.name}`);
      console.log(`   ID: ${product.id || 'UNDEFINED'}`);
      console.log(`   Quantidade: ${product.quantity}`);
      console.log(`   Preço: ${product.unitPrice}`);
      console.log(`   Chaves do objeto: ${Object.keys(product).join(', ')}`);
      console.log('');
    });
    
    // Verificar quantos produtos têm ID
    const productsWithId = products.filter(p => p.id);
    const productsWithoutId = products.filter(p => !p.id);
    
    console.log(`📊 Estatísticas:`);
    console.log(`✅ Produtos com ID: ${productsWithId.length}`);
    console.log(`❌ Produtos sem ID: ${productsWithoutId.length}`);
    
    if (productsWithoutId.length > 0) {
      console.log('\n💡 Problema identificado: Produtos sem ID não podem ser excluídos individualmente');
      console.log('🔧 Solução: Usar nome do produto como identificador único');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkProductIds();
