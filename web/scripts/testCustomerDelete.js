// Script para testar exclusão de clientes
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function testCustomerDelete() {
  try {
    console.log('🧪 Testando exclusão de clientes...\n');
    
    // 1. Buscar clientes existentes
    const customersResponse = await fetch(`${API_BASE}?table=customers`);
    const customers = await customersResponse.json();
    console.log(`👥 Clientes antes: ${customers.length}`);
    
    if (customers.length > 0) {
      const customerToDelete = customers[0];
      console.log(`🗑️ Excluindo cliente: ${customerToDelete.name} (ID: ${customerToDelete.id})`);
      
      // Filtrar clientes por ID
      const filteredCustomers = customers.filter(c => c.id !== customerToDelete.id);
      console.log(`👥 Clientes após filtro: ${filteredCustomers.length}`);
      
      // Testar exclusão real
      const deleteResponse = await fetch(`${API_BASE}?table=customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'overwrite', 
          rows: filteredCustomers
        })
      });
      
      console.log(`📡 Status da resposta: ${deleteResponse.status}`);
      
      if (deleteResponse.ok) {
        // Verificar resultado
        const customersAfterResponse = await fetch(`${API_BASE}?table=customers`);
        const customersAfter = await customersAfterResponse.json();
        console.log(`👥 Clientes depois: ${customersAfter.length}`);
        
        if (customersAfter.length === customers.length - 1) {
          console.log('✅ Exclusão de cliente funcionou!');
          
          // Verificar se o cliente específico foi removido
          const customerStillExists = customersAfter.find(c => c.id === customerToDelete.id);
          if (customerStillExists) {
            console.log('❌ PROBLEMA: Cliente ainda existe na lista!');
          } else {
            console.log('✅ Cliente foi removido corretamente!');
          }
        } else {
          console.log('❌ Exclusão falhou - número incorreto de clientes');
          console.log(`Esperado: ${customers.length - 1}, Obtido: ${customersAfter.length}`);
        }
      } else {
        const errorText = await deleteResponse.text();
        console.log('❌ Erro na exclusão:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testCustomerDelete();
