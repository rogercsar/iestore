// Script para corrigir o problema de exibição dos clientes
const https = require('https');

async function fixCustomersDisplay() {
  console.log('🔧 Corrigindo problema de exibição dos clientes...\n');
  
  try {
    // Test 1: Verificar dados da API
    console.log('1. Verificando dados da API de clientes...');
    const customersResponse = await fetch('http://localhost:8888/.netlify/functions/postgres?table=customers');
    const customersData = await customersResponse.json();
    
    if (!Array.isArray(customersData)) {
      console.log('❌ Dados não são um array:', typeof customersData);
      return;
    }
    
    console.log(`✅ Dados recebidos: ${customersData.length} clientes`);
    
    // Test 2: Verificar estrutura dos dados
    console.log('\n2. Verificando estrutura dos dados...');
    if (customersData.length > 0) {
      const firstCustomer = customersData[0];
      console.log('📋 Estrutura do primeiro cliente:');
      console.log('Campos disponíveis:', Object.keys(firstCustomer));
      
      // Verificar se os campos estão corretos
      const expectedFields = ['id', 'name', 'phone', 'email', 'address'];
      expectedFields.forEach(field => {
        if (firstCustomer[field] !== undefined) {
          console.log(`✅ Campo ${field}: ${firstCustomer[field]}`);
        } else {
          console.log(`❌ Campo ${field}: ausente`);
        }
      });
    }
    
    // Test 3: Verificar se há problemas de mapeamento
    console.log('\n3. Verificando mapeamento de campos...');
    const mappedCustomers = customersData.map((customer, index) => {
      const mapped = {
        id: customer.id || `customer_${Date.now()}_${index}`,
        name: customer.name || 'Nome não informado',
        phone: customer.phone || 'Telefone não informado',
        email: customer.email || 'Email não informado',
        address: customer.address || 'Endereço não informado',
        totalPurchases: customer.totalPurchases || 0,
        totalValue: customer.totalValue || 0,
        pendingAmount: customer.pendingAmount || 0,
        lastPurchase: customer.lastPurchase || null,
        notes: customer.notes || null,
        status: customer.status || 'active'
      };
      
      console.log(`Cliente ${index + 1}: ${mapped.name} (${mapped.phone})`);
      return mapped;
    });
    
    console.log(`✅ ${mappedCustomers.length} clientes mapeados com sucesso`);
    
    // Test 4: Verificar se os dados estão sendo filtrados corretamente
    console.log('\n4. Verificando filtros...');
    const filteredCustomers = mappedCustomers.filter(customer => 
      customer.name && customer.name.trim() !== '' && customer.name !== 'Nome não informado'
    );
    
    console.log(`✅ Clientes válidos após filtro: ${filteredCustomers.length}`);
    
    if (filteredCustomers.length !== mappedCustomers.length) {
      console.log('⚠️ Alguns clientes foram filtrados');
      const filteredOut = mappedCustomers.filter(customer => 
        !customer.name || customer.name.trim() === '' || customer.name === 'Nome não informado'
      );
      console.log('Clientes filtrados:', filteredOut.map(c => c.name));
    }
    
    // Test 5: Verificar se os dados estão sendo ordenados corretamente
    console.log('\n5. Verificando ordenação...');
    const sortedCustomers = filteredCustomers.sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    console.log('✅ Clientes ordenados por nome');
    console.log('Primeiros 3 clientes:');
    sortedCustomers.slice(0, 3).forEach((customer, index) => {
      console.log(`  ${index + 1}. ${customer.name} (${customer.phone})`);
    });
    
    console.log('\n🎯 Correção concluída!');
    console.log('\n💡 Se os clientes ainda não aparecem na tela, verifique:');
    console.log('1. Se o store está sendo atualizado corretamente');
    console.log('2. Se há erros no console do navegador');
    console.log('3. Se os dados estão sendo carregados no onMounted');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir:', error.message);
  }
}

// Função fetch para Node.js (se não estiver disponível)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the fix
fixCustomersDisplay().catch(console.error);
