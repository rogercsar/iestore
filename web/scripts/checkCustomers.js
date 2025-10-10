// Script para verificar dados de clientes na API
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkCustomers() {
  try {
    console.log('🔍 Verificando clientes na API...');
    
    const response = await fetch(`${API_BASE}?table=customers`);
    const customers = await response.json();
    
    console.log(`👥 Total de clientes na API: ${customers.length}`);
    console.log('\n📋 Lista de clientes:');
    
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ${customer.email || 'Sem email'} - ${customer.phone || 'Sem telefone'}`);
    });
    
    // Verificar se há clientes mock (com IDs como customer-1, customer-2, etc.)
    const mockCustomers = customers.filter(c => c.id && c.id.match(/^customer-\d+$/));
    const realCustomers = customers.filter(c => !c.id || !c.id.match(/^customer-\d+$/));
    
    console.log(`\n📊 Análise:`);
    console.log(`❌ Clientes mock: ${mockCustomers.length}`);
    console.log(`✅ Clientes reais: ${realCustomers.length}`);
    
    if (mockCustomers.length > 0) {
      console.log('\n🗑️ Clientes mock encontrados:');
      mockCustomers.forEach(c => {
        console.log(`- ${c.name} (${c.id})`);
      });
      
      console.log('\n💡 Solução: Execute o script de limpeza de clientes');
    } else {
      console.log('\n✅ Apenas clientes reais encontrados!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar clientes:', error.message);
  }
}

checkCustomers();
