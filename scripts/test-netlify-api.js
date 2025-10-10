// Script para testar a API da Netlify
const https = require('https');

// Substitua pela URL real da sua aplicação Netlify
const NETLIFY_URL = 'https://seu-site.netlify.app';

async function testNetlifyAPI() {
  console.log('🧪 Testando API da Netlify...\n');
  
  try {
    // Test 1: Test function
    console.log('1. Testando função de teste...');
    const testResponse = await fetch(`${NETLIFY_URL}/.netlify/functions/test`);
    const testData = await testResponse.json();
    console.log('✅ Função de teste:', testData.message);
    console.log('📊 Database status:', testData.database?.connected ? 'Conectado' : 'Desconectado');
    
    if (testData.database?.tables) {
      console.log('📋 Tabelas encontradas:');
      testData.database.tables.forEach(table => {
        console.log(`  - ${table.table_name}: ${table.count} registros`);
      });
    }
    
    // Test 2: Customers API
    console.log('\n2. Testando API de clientes...');
    const customersResponse = await fetch(`${NETLIFY_URL}/.netlify/functions/postgres?table=customers`);
    const customersData = await customersResponse.json();
    console.log(`✅ Clientes encontrados: ${customersData.length}`);
    
    if (customersData.length > 0) {
      console.log('👥 Primeiros clientes:');
      customersData.slice(0, 3).forEach((customer, index) => {
        console.log(`  ${index + 1}. ${customer.name} (${customer.phone || 'sem telefone'})`);
      });
    } else {
      console.log('❌ Nenhum cliente encontrado!');
    }
    
    // Test 3: Products API
    console.log('\n3. Testando API de produtos...');
    const productsResponse = await fetch(`${NETLIFY_URL}/.netlify/functions/postgres?table=products`);
    const productsData = await productsResponse.json();
    console.log(`✅ Produtos encontrados: ${productsData.length}`);
    
    if (productsData.length > 0) {
      console.log('📦 Primeiros produtos:');
      productsData.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.unitPrice} (${product.quantity} unidades)`);
      });
    }
    
    // Test 4: Sales API
    console.log('\n4. Testando API de vendas...');
    const salesResponse = await fetch(`${NETLIFY_URL}/.netlify/functions/postgres?table=sales`);
    const salesData = await salesResponse.json();
    console.log(`✅ Vendas encontradas: ${salesData.length}`);
    
    if (salesData.length > 0) {
      console.log('💰 Últimas vendas:');
      salesData.slice(0, 3).forEach((sale, index) => {
        console.log(`  ${index + 1}. ${sale.product} - ${sale.customerName || 'Cliente não informado'}`);
        console.log(`     Data: ${sale.dateISO}`);
        console.log(`     Valor: R$ ${sale.totalValue}`);
      });
    }
    
    // Test 5: Dashboard API
    console.log('\n5. Testando API do dashboard...');
    const dashboardResponse = await fetch(`${NETLIFY_URL}/.netlify/functions/postgres?table=dashboard`);
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard data:');
    console.log(`  - Total produtos: ${dashboardData.totalProducts}`);
    console.log(`  - Total clientes: ${dashboardData.totalCustomers}`);
    console.log(`  - Total vendas: R$ ${dashboardData.totalSalesValue}`);
    console.log(`  - Lucro total: R$ ${dashboardData.totalProfit}`);
    
    console.log('\n🎉 Todos os testes da API passaram!');
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    console.log('\n💡 Verifique se:');
    console.log('1. A aplicação está deployada na Netlify');
    console.log('2. As variáveis de ambiente estão configuradas');
    console.log('3. A URL está correta');
  }
}

// Função fetch para Node.js (se não estiver disponível)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the test
testNetlifyAPI().catch(console.error);
