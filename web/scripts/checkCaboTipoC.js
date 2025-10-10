// Script para verificar especificamente o produto "Cabo tipo C"
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function checkCaboTipoC() {
  try {
    console.log('🔍 Verificando produto "Cabo tipo C"...\n');
    
    const response = await fetch(`${API_BASE}?table=products`);
    const products = await response.json();
    
    const caboTipoC = products.find(p => p.name === 'Cabo tipo C');
    
    if (caboTipoC) {
      console.log('📦 Produto encontrado:');
      console.log(JSON.stringify(caboTipoC, null, 2));
      console.log('\n📊 Análise:');
      console.log(`   Nome: ${caboTipoC.name}`);
      console.log(`   Custo (unitário): R$ ${caboTipoC.cost}`);
      console.log(`   Preço (unitário): R$ ${caboTipoC.unitPrice}`);
      console.log(`   Quantidade: ${caboTipoC.quantity}`);
      console.log(`   Custo total (custo × qty): R$ ${(caboTipoC.cost * caboTipoC.quantity).toFixed(2)}`);
      console.log(`   Preço total (preço × qty): R$ ${(caboTipoC.unitPrice * caboTipoC.quantity).toFixed(2)}`);
      
      // Verificar se os valores estão corretos
      if (caboTipoC.unitPrice === 70 && caboTipoC.cost === 20) {
        console.log('\n❌ PROBLEMA IDENTIFICADO:');
        console.log('   Os valores já estão multiplicados pela quantidade no banco!');
        console.log(`   Valor correto deveria ser: Custo R$ 10.00, Preço R$ 35.00`);
      } else if (caboTipoC.unitPrice === 35 && caboTipoC.cost === 10) {
        console.log('\n✅ Valores estão corretos no banco!');
        console.log('   O problema deve estar no frontend.');
      }
    } else {
      console.log('❌ Produto "Cabo tipo C" não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkCaboTipoC();
