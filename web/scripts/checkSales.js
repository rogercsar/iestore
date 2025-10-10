// Script para verificar vendas no banco de dados
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkSales() {
  try {
    console.log('🔍 Verificando vendas no banco de dados...\n');
    
    const response = await fetch(`${API_BASE}?table=sales`);
    const sales = await response.json();
    
    console.log(`💰 Total de vendas no banco: ${sales.length}\n`);
    
    if (sales.length > 0) {
      console.log('📋 Vendas encontradas:');
      sales.forEach((sale, index) => {
        console.log(`${index + 1}. ID: ${sale.id || 'N/A'}`);
        console.log(`   Cliente: ${sale.customerId || sale.customer || 'N/A'}`);
        console.log(`   Data: ${sale.createdAt || sale.date || 'N/A'}`);
        console.log(`   Valor Total: R$ ${sale.totalValue || sale.totalAmount || 'N/A'}`);
        console.log(`   Itens: ${sale.items ? sale.items.length : 0}`);
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach((item, i) => {
            console.log(`     ${i + 1}. ${item.name} - Qty: ${item.quantity} - R$ ${item.unitPrice}`);
          });
        }
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma venda encontrada no banco de dados!');
      console.log('💡 Isso pode indicar:');
      console.log('   1. Problema na função de criação de vendas');
      console.log('   2. Erro na API PostgreSQL');
      console.log('   3. Dados não estão sendo salvos corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar vendas:', error.message);
  }
}

checkSales();
