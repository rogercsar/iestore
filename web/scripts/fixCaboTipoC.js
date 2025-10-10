// Script para corrigir os valores do "Cabo tipo C" se estiverem incorretos
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function fixCaboTipoC() {
  try {
    console.log('🔧 Verificando e corrigindo "Cabo tipo C"...\n');
    
    // Buscar todos os produtos
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    console.log(`📦 Total de produtos: ${products.length}`);
    
    // Encontrar o Cabo tipo C
    const caboIndex = products.findIndex(p => p.name === 'Cabo tipo C');
    
    if (caboIndex === -1) {
      console.log('❌ Produto "Cabo tipo C" não encontrado!');
      return;
    }
    
    const cabo = products[caboIndex];
    console.log('📦 Produto atual:', JSON.stringify(cabo, null, 2));
    
    // Verificar se precisa corrigir
    const needsFix = parseFloat(cabo.cost) !== 10 || parseFloat(cabo.unitPrice) !== 35;
    
    if (needsFix) {
      console.log('\n🔧 Corrigindo valores...');
      products[caboIndex] = {
        ...cabo,
        cost: 10,
        unitPrice: 35,
        quantity: 2
      };
      
      // Atualizar todos os produtos
      const updateResponse = await fetch(`${API_BASE}?table=products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'overwrite', rows: products })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Produto corrigido com sucesso!');
      } else {
        console.log('❌ Erro ao atualizar produto');
      }
    } else {
      console.log('\n✅ Valores já estão corretos no banco de dados!');
      console.log('   Custo: R$ 10.00');
      console.log('   Preço: R$ 35.00');
      console.log('\n💡 O problema deve estar no cache do navegador.');
      console.log('   Solução: Pressione Ctrl+Shift+R para limpar o cache e recarregar.');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

fixCaboTipoC();
