// Script para limpar clientes mock e manter apenas os reais
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function cleanCustomers() {
  try {
    console.log('🔄 Iniciando limpeza de clientes mock...');
    
    // 1. Buscar todos os clientes existentes
    console.log('👥 Buscando clientes existentes...');
    const getResponse = await fetch(`${API_BASE}?table=customers`);
    const existingCustomers = await getResponse.json();
    console.log(`👥 Encontrados ${existingCustomers.length} clientes existentes`);
    
    // 2. Filtrar apenas clientes reais (não mock)
    const realCustomers = existingCustomers.filter(customer => {
      // Clientes mock têm IDs como customer-1, customer-2, etc.
      return !customer.id || !customer.id.match(/^customer-\d+$/);
    });
    
    console.log(`✅ Clientes reais encontrados: ${realCustomers.length}`);
    console.log(`❌ Clientes mock encontrados: ${existingCustomers.length - realCustomers.length}`);
    
    if (realCustomers.length === existingCustomers.length) {
      console.log('✅ Não há clientes mock para remover!');
      return;
    }
    
    // 3. Substituir todos os clientes pelos reais
    console.log('🔄 Substituindo clientes pelos reais...');
    const replaceResponse = await fetch(`${API_BASE}?table=customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'overwrite', rows: realCustomers })
    });
    
    if (replaceResponse.ok) {
      console.log(`✅ Limpeza concluída! ${realCustomers.length} clientes reais mantidos`);
      console.log(`🗑️ ${existingCustomers.length - realCustomers.length} clientes mock removidos`);
      
      // 4. Verificar resultado
      console.log('\n🔍 Verificando resultado...');
      const verifyResponse = await fetch(`${API_BASE}?table=customers`);
      const finalCustomers = await verifyResponse.json();
      console.log(`👥 Total final de clientes: ${finalCustomers.length}`);
      
      console.log('\n📋 Clientes finais:');
      finalCustomers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.name} - ${customer.email || 'Sem email'} - ${customer.phone || 'Sem telefone'}`);
      });
      
    } else {
      console.log(`❌ Erro ao substituir clientes: ${replaceResponse.status}`);
      const errorText = await replaceResponse.text();
      console.log('Detalhes do erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

cleanCustomers();
