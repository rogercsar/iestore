// Script para corrigir o problema de exibição das vendas
const https = require('https');

async function fixSalesDisplay() {
  console.log('🔧 Corrigindo problema de exibição das vendas...\n');
  
  try {
    // Test 1: Verificar dados da API
    console.log('1. Verificando dados da API de vendas...');
    const salesResponse = await fetch('http://localhost:8888/.netlify/functions/postgres?table=sales');
    const salesData = await salesResponse.json();
    
    if (!Array.isArray(salesData)) {
      console.log('❌ Dados não são um array:', typeof salesData);
      return;
    }
    
    console.log(`✅ Dados recebidos: ${salesData.length} vendas`);
    
    // Test 2: Verificar estrutura dos dados
    console.log('\n2. Verificando estrutura dos dados...');
    if (salesData.length > 0) {
      const firstSale = salesData[0];
      console.log('📋 Estrutura da primeira venda:');
      console.log('Campos disponíveis:', Object.keys(firstSale));
      
      // Verificar se os campos estão corretos
      const expectedFields = ['id', 'dateISO', 'product', 'quantity', 'totalValue', 'customerName'];
      expectedFields.forEach(field => {
        if (firstSale[field] !== undefined) {
          console.log(`✅ Campo ${field}: ${firstSale[field]}`);
        } else {
          console.log(`❌ Campo ${field}: ausente`);
        }
      });
    }
    
    // Test 3: Verificar se há problemas de mapeamento
    console.log('\n3. Verificando mapeamento de campos...');
    const mappedSales = salesData.map((sale, index) => {
      const mapped = {
        id: sale.id || `sale_${Date.now()}_${index}`,
        dateISO: sale.dateISO || new Date().toISOString(),
        product: sale.product || 'Produto não informado',
        quantity: parseInt(sale.quantity) || 0,
        totalValue: parseFloat(sale.totalValue) || 0,
        totalCost: parseFloat(sale.totalCost) || 0,
        profit: parseFloat(sale.profit) || 0,
        customerName: sale.customerName || 'Cliente não informado',
        customerPhone: sale.customerPhone || null,
        paymentMethod: sale.paymentMethod || 'Não informado',
        status: sale.status || 'paid'
      };
      
      console.log(`Venda ${index + 1}: ${mapped.product} - ${mapped.customerName} (R$ ${mapped.totalValue})`);
      return mapped;
    });
    
    console.log(`✅ ${mappedSales.length} vendas mapeadas com sucesso`);
    
    // Test 4: Verificar se os dados estão sendo filtrados corretamente
    console.log('\n4. Verificando filtros...');
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todaySales = mappedSales.filter(sale => {
      const saleDate = new Date(sale.dateISO);
      return saleDate >= todayStart;
    });
    
    console.log(`✅ Vendas de hoje: ${todaySales.length}`);
    
    // Test 5: Verificar se os dados estão sendo ordenados corretamente
    console.log('\n5. Verificando ordenação...');
    const sortedSales = mappedSales.sort((a, b) => 
      new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
    
    console.log('✅ Vendas ordenadas por data (mais recentes primeiro)');
    console.log('Últimas 3 vendas:');
    sortedSales.slice(0, 3).forEach((sale, index) => {
      console.log(`  ${index + 1}. ${sale.product} - ${sale.customerName} (${new Date(sale.dateISO).toLocaleDateString('pt-BR')})`);
    });
    
    // Test 6: Verificar se há problemas com o status
    console.log('\n6. Verificando status das vendas...');
    const statusCounts = mappedSales.reduce((acc, sale) => {
      acc[sale.status] = (acc[sale.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Contagem por status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} vendas`);
    });
    
    console.log('\n🎯 Correção concluída!');
    console.log('\n💡 Se as vendas ainda não aparecem na tela, verifique:');
    console.log('1. Se o store está sendo atualizado corretamente');
    console.log('2. Se há erros no console do navegador');
    console.log('3. Se os dados estão sendo carregados no onMounted');
    console.log('4. Se os filtros de data estão funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir:', error.message);
  }
}

// Função fetch para Node.js (se não estiver disponível)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the fix
fixSalesDisplay().catch(console.error);
