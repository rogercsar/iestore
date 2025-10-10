// Script para verificar quantos produtos existem na API
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkProducts() {
  try {
    console.log('🔍 Verificando produtos na API...');
    
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    console.log(`📦 Total de produtos na API: ${products.length}`);
    console.log('\n📋 Lista de produtos:');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.quantity} unidades - R$ ${product.unitPrice}`);
    });
    
    // Verificar se são apenas os 23 produtos reais
    const realProductNames = [
      "Copo café Stanley", "Garrafa preta Stanley", "Garrafa Stanley azul",
      "Tomada inteligente", "Capinha colorida iPhone", "Capinha transparente",
      "Película", "Microfone Kaidi", "Cabo tipo C", "Fone Bluetooth",
      "Powerbank", "Relógio digital aziki", "Game box", "Fone Bluetooth kaidi",
      "Mouse", "Carregador micro inova", "Carregador micro kaidi",
      "Carregador tipo c", "Powerbank com cabo", "Fone com cabo",
      "Cabo USB tipo c", "Cabo tipo c inova 2m", "Pulseira avulsa Relógio"
    ];
    
    const hasOnlyRealProducts = products.every(p => realProductNames.includes(p.name));
    const hasAllRealProducts = realProductNames.every(name => products.some(p => p.name === name));
    
    console.log(`\n✅ Apenas produtos reais: ${hasOnlyRealProducts ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Todos os 23 produtos: ${hasAllRealProducts ? 'SIM' : 'NÃO'}`);
    
    if (products.length === 23 && hasOnlyRealProducts && hasAllRealProducts) {
      console.log('\n🎉 SUCESSO! Apenas os 23 produtos reais estão no banco!');
    } else {
      console.log('\n❌ Ainda há produtos mock ou faltando produtos reais.');
      console.log('💡 Solução: Execute o script de limpeza novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar produtos:', error.message);
  }
}

checkProducts();
