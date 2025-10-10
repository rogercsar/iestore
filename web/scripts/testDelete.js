// Script para testar exclusão de produtos e clientes
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function testDelete() {
  try {
    console.log('🧪 Testando exclusões...\n');
    
    // 1. Testar exclusão de produto
    console.log('1️⃣ Testando exclusão de produto...');
    
    // Buscar produtos existentes
    const productsResponse = await fetch(`${API_BASE}?table=products`);
    const products = await productsResponse.json();
    console.log(`📦 Produtos antes: ${products.length}`);
    
    if (products.length > 0) {
      const productToDelete = products[0];
      console.log(`🗑️ Excluindo produto: ${productToDelete.name}`);
      
      // Excluir produto
      const deleteProductResponse = await fetch(`${API_BASE}?table=products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'overwrite', 
          rows: products.filter(p => p.id !== productToDelete.id)
        })
      });
      
      if (deleteProductResponse.ok) {
        // Verificar se foi excluído
        const productsAfterResponse = await fetch(`${API_BASE}?table=products`);
        const productsAfter = await productsAfterResponse.json();
        console.log(`📦 Produtos depois: ${productsAfter.length}`);
        
        if (productsAfter.length === products.length - 1) {
          console.log('✅ Exclusão de produto funcionou!');
        } else {
          console.log('❌ Exclusão de produto falhou!');
        }
      } else {
        console.log('❌ Erro na exclusão de produto:', deleteProductResponse.status);
      }
    }
    
    console.log('\n2️⃣ Testando exclusão de cliente...');
    
    // Buscar clientes existentes
    const customersResponse = await fetch(`${API_BASE}?table=customers`);
    const customers = await customersResponse.json();
    console.log(`👥 Clientes antes: ${customers.length}`);
    
    if (customers.length > 0) {
      const customerToDelete = customers[0];
      console.log(`🗑️ Excluindo cliente: ${customerToDelete.name}`);
      
      // Excluir cliente
      const deleteCustomerResponse = await fetch(`${API_BASE}?table=customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'overwrite', 
          rows: customers.filter(c => c.id !== customerToDelete.id)
        })
      });
      
      if (deleteCustomerResponse.ok) {
        // Verificar se foi excluído
        const customersAfterResponse = await fetch(`${API_BASE}?table=customers`);
        const customersAfter = await customersAfterResponse.json();
        console.log(`👥 Clientes depois: ${customersAfter.length}`);
        
        if (customersAfter.length === customers.length - 1) {
          console.log('✅ Exclusão de cliente funcionou!');
        } else {
          console.log('❌ Exclusão de cliente falhou!');
        }
      } else {
        console.log('❌ Erro na exclusão de cliente:', deleteCustomerResponse.status);
      }
    }
    
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testDelete();
