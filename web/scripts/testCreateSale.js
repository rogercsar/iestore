// Script para testar criação de vendas
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function testCreateSale() {
  try {
    console.log('🧪 Testando criação de venda...\n');
    
    // Dados de teste para uma venda
    const testSale = {
      dateISO: new Date().toISOString(),
      product: 'Cabo tipo C',
      quantity: 1,
      totalValue: 35.00,
      totalCost: 10.00,
      profit: 25.00,
      customerName: 'Cliente Teste',
      customerPhone: '11999999999',
      paymentMethod: 'pix',
      status: 'paid'
    };
    
    console.log('📦 Dados da venda de teste:');
    console.log(JSON.stringify(testSale, null, 2));
    
    // Tentar criar a venda
    const response = await fetch(`${API_BASE}?table=sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'append',
        rows: [testSale]
      })
    });
    
    console.log(`\n📡 Status da resposta: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Venda criada com sucesso!');
      console.log('📋 Resposta:', JSON.stringify(result, null, 2));
      
      // Verificar se a venda foi salva
      console.log('\n🔍 Verificando se a venda foi salva...');
      const checkResponse = await fetch(`${API_BASE}?table=sales`);
      const sales = await checkResponse.json();
      console.log(`💰 Total de vendas após criação: ${sales.length}`);
      
      if (sales.length > 0) {
        console.log('✅ Venda foi salva no banco!');
        console.log('📋 Última venda:', JSON.stringify(sales[0], null, 2));
      } else {
        console.log('❌ Venda não foi salva no banco!');
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Erro ao criar venda:');
      console.log('Status:', response.status);
      console.log('Erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testCreateSale();
