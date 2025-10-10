// Script para debugar o problema de exibição dos dados no frontend
const https = require('https');

async function debugFrontendData() {
  console.log('🔍 Debugando problema de exibição no frontend...\n');
  
  try {
    // Test 1: Verificar dados da API
    console.log('1. Verificando dados da API de clientes...');
    const customersResponse = await fetch('http://localhost:8888/.netlify/functions/postgres?table=customers');
    const customersData = await customersResponse.json();
    
    console.log(`✅ Dados recebidos: ${customersData.length} clientes`);
    console.log('📋 Estrutura dos dados:');
    console.log(JSON.stringify(customersData, null, 2));
    
    // Test 2: Verificar se os dados estão sendo processados corretamente
    console.log('\n2. Verificando processamento dos dados...');
    if (Array.isArray(customersData)) {
      console.log(`✅ Dados são um array com ${customersData.length} itens`);
      
      if (customersData.length > 0) {
        const firstCustomer = customersData[0];
        console.log('📋 Estrutura do primeiro cliente:');
        console.log('Campos disponíveis:', Object.keys(firstCustomer));
        
        // Verificar campos obrigatórios
        const requiredFields = ['id', 'name', 'phone', 'email'];
        requiredFields.forEach(field => {
          if (firstCustomer[field]) {
            console.log(`✅ Campo ${field}: ${firstCustomer[field]}`);
          } else {
            console.log(`❌ Campo ${field}: ausente ou vazio`);
          }
        });
        
        // Verificar se há campos extras que podem estar causando problemas
        const extraFields = Object.keys(firstCustomer).filter(key => 
          !['id', 'name', 'phone', 'email', 'address', 'totalPurchases', 'totalValue', 'pendingAmount', 'lastPurchase', 'notes', 'status'].includes(key)
        );
        
        if (extraFields.length > 0) {
          console.log('⚠️ Campos extras encontrados:', extraFields);
        }
      }
    }
    
    // Test 3: Verificar se os dados estão sendo mapeados corretamente
    console.log('\n3. Verificando mapeamento dos dados...');
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
    
    // Test 6: Verificar se há problemas com o status
    console.log('\n6. Verificando status dos clientes...');
    const statusCounts = mappedCustomers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Contagem por status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} clientes`);
    });
    
    console.log('\n🎯 Debug concluído!');
    console.log('\n💡 Se os clientes ainda não aparecem no frontend, verifique:');
    console.log('1. Se o store está sendo atualizado corretamente');
    console.log('2. Se há erros no console do navegador');
    console.log('3. Se os dados estão sendo carregados no onMounted');
    console.log('4. Se há problemas com a reatividade do Vue');
    
  } catch (error) {
    console.error('❌ Erro ao debugar:', error.message);
  }
}

// Função fetch para Node.js (se não estiver disponível)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the debug
debugFrontendData().catch(console.error);
