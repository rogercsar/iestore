// Script para verificar valores dos produtos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkProductValues() {
  try {
    console.log('🔍 Verificando valores dos produtos...\n');
    
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    console.log(`📦 Total de produtos: ${products.length}\n`);
    
    console.log('📋 Valores dos primeiros 5 produtos:');
    products.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Custo unitário: R$ ${product.cost}`);
      console.log(`   Preço unitário: R$ ${product.unitPrice}`);
      console.log(`   Quantidade: ${product.quantity}`);
      console.log(`   Custo total (custo × qty): R$ ${(product.cost * product.quantity).toFixed(2)}`);
      console.log(`   Preço total (preço × qty): R$ ${(product.unitPrice * product.quantity).toFixed(2)}`);
      console.log(`   Margem: ${(((product.unitPrice - product.cost) / product.cost) * 100).toFixed(1)}%`);
      console.log('');
    });
    
    // Verificar se há produtos com valores muito altos (possível soma incorreta)
    const highValueProducts = products.filter(p => p.unitPrice > 1000 || p.cost > 1000);
    if (highValueProducts.length > 0) {
      console.log('⚠️ Produtos com valores altos (possível problema):');
      highValueProducts.forEach(p => {
        console.log(`- ${p.name}: Custo R$ ${p.cost}, Preço R$ ${p.unitPrice}`);
      });
    } else {
      console.log('✅ Todos os produtos têm valores unitários normais');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkProductValues();
