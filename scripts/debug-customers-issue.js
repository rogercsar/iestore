// Script para debugar o problema dos clientes
const https = require('https');

async function debugCustomersIssue() {
  console.log('🔍 Debugando problema dos clientes...\n');
  
  try {
    // Test 1: Verificar se a API está funcionando
    console.log('1. Verificando se a API está funcionando...');
    const testResponse = await fetch('http://localhost:8888/.netlify/functions/test');
    const testData = await testResponse.json();
    console.log('✅ API funcionando:', testData.message);
    
    // Test 2: Verificar dados brutos da API de clientes
    console.log('\n2. Verificando dados brutos da API de clientes...');
    const customersResponse = await fetch('http://localhost:8888/.netlify/functions/postgres?table=customers');
    const customersData = await customersResponse.json();
    console.log('📊 Dados brutos dos clientes:');
    console.log(JSON.stringify(customersData, null, 2));
    
    // Test 3: Verificar se os dados estão sendo processados corretamente
    console.log('\n3. Verificando processamento dos dados...');
    if (Array.isArray(customersData)) {
      console.log(`✅ Dados são um array com ${customersData.length} itens`);
      
      if (customersData.length > 0) {
        console.log('📋 Estrutura do primeiro cliente:');
        const firstCustomer = customersData[0];
        console.log('Campos disponíveis:', Object.keys(firstCustomer));
        console.log('Dados do primeiro cliente:', firstCustomer);
        
        // Verificar campos obrigatórios
        const requiredFields = ['id', 'name', 'phone', 'email'];
        requiredFields.forEach(field => {
          if (firstCustomer[field]) {
            console.log(`✅ Campo ${field}: ${firstCustomer[field]}`);
          } else {
            console.log(`❌ Campo ${field}: ausente ou vazio`);
          }
        });
      } else {
        console.log('❌ Array de clientes está vazio!');
      }
    } else {
      console.log('❌ Dados não são um array:', typeof customersData);
    }
    
    // Test 4: Verificar se há erros na API
    console.log('\n4. Verificando se há erros na API...');
    if (customersData.error) {
      console.log('❌ Erro na API:', customersData.error);
    } else {
      console.log('✅ Nenhum erro na API');
    }
    
    // Test 5: Verificar se os dados estão sendo filtrados corretamente
    console.log('\n5. Verificando filtros...');
    if (Array.isArray(customersData) && customersData.length > 0) {
      const filteredCustomers = customersData.filter(customer => 
        customer.name && customer.name.trim() !== ''
      );
      console.log(`✅ Clientes com nome válido: ${filteredCustomers.length}`);
      
      if (filteredCustomers.length !== customersData.length) {
        console.log('⚠️ Alguns clientes foram filtrados por ter nome vazio');
      }
    }
    
    console.log('\n🎯 Debug concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao debugar:', error.message);
    console.log('\n💡 Verifique se:');
    console.log('1. O Netlify Dev está rodando (netlify dev)');
    console.log('2. As variáveis de ambiente estão configuradas');
    console.log('3. A conexão com o banco está funcionando');
  }
}

// Função fetch para Node.js (se não estiver disponível)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the debug
debugCustomersIssue().catch(console.error);
