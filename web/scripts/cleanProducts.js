// Script para limpar todos os produtos e adicionar apenas os 23 produtos reais
import fetch from 'node-fetch';

const API_BASE = 'https://iestore.netlify.app/.netlify/functions/postgres';

async function cleanAndReplaceProducts() {
  try {
    console.log('🔄 Iniciando limpeza e substituição de produtos...');
    
    // 1. Buscar todos os produtos existentes
    console.log('📦 Buscando produtos existentes...');
    const getResponse = await fetch(`${API_BASE}?table=products`);
    const existingProducts = await getResponse.json();
    console.log(`📦 Encontrados ${existingProducts.length} produtos existentes`);
    
    // 2. Usar operação overwrite para substituir todos os produtos
    console.log('🔄 Substituindo todos os produtos pelos 23 produtos reais...');
    const realProducts = [
      {
        name: "Copo café Stanley",
        quantity: 0,
        cost: 99.00,
        unitPrice: 0.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Garrafa preta Stanley",
        quantity: 2,
        cost: 76.00,
        unitPrice: 196.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Garrafa Stanley azul",
        quantity: 1,
        cost: 20.00,
        unitPrice: 49.90,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Tomada inteligente",
        quantity: 1,
        cost: 38.00,
        unitPrice: 108.00,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Capinha colorida iPhone",
        quantity: 5,
        cost: 35.00,
        unitPrice: 135.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Capinha transparente",
        quantity: 4,
        cost: 28.00,
        unitPrice: 116.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Película",
        quantity: 8,
        cost: 28.00,
        unitPrice: 152.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Microfone Kaidi",
        quantity: 1,
        cost: 50.00,
        unitPrice: 119.00,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Cabo tipo C",
        quantity: 2,
        cost: 20.00,
        unitPrice: 70.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Fone Bluetooth",
        quantity: 4,
        cost: 64.00,
        unitPrice: 199.60,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Powerbank",
        quantity: 1,
        cost: 80.00,
        unitPrice: 200.00,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1609592807257-6e4e4e8c5b8f?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Relógio digital aziki",
        quantity: 1,
        cost: 80.00,
        unitPrice: 189.00,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Game box",
        quantity: 1,
        cost: 30.00,
        unitPrice: 80.00,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Fone Bluetooth kaidi",
        quantity: 1,
        cost: 60.00,
        unitPrice: 179.00,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Mouse",
        quantity: 1,
        cost: 25.00,
        unitPrice: 49.90,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Carregador micro inova",
        quantity: 1,
        cost: 10.00,
        unitPrice: 49.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Carregador micro kaidi",
        quantity: 1,
        cost: 15.00,
        unitPrice: 79.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Carregador tipo c",
        quantity: 2,
        cost: 40.00,
        unitPrice: 158.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Powerbank com cabo",
        quantity: 1,
        cost: 70.00,
        unitPrice: 185.00,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1609592807257-6e4e4e8c5b8f?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Fone com cabo",
        quantity: 1,
        cost: 5.00,
        unitPrice: 10.00,
        category: "Eletrônicos",
        photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Cabo USB tipo c",
        quantity: 1,
        cost: 10.00,
        unitPrice: 29.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Cabo tipo c inova 2m",
        quantity: 1,
        cost: 15.00,
        unitPrice: 39.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center"
      },
      {
        name: "Pulseira avulsa Relógio",
        quantity: 1,
        cost: 10.00,
        unitPrice: 29.00,
        category: "Acessórios",
        photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center"
      }
    ];
    
    // Usar operação overwrite para substituir todos os produtos de uma vez
    try {
      const replaceResponse = await fetch(`${API_BASE}?table=products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'overwrite', rows: realProducts })
      });
      
      if (replaceResponse.ok) {
        console.log(`✅ Todos os ${realProducts.length} produtos substituídos com sucesso!`);
        console.log('📦 Produtos antigos removidos e novos produtos adicionados');
      } else {
        console.log(`❌ Erro ao substituir produtos: ${replaceResponse.status}`);
        const errorText = await replaceResponse.text();
        console.log('Detalhes do erro:', errorText);
      }
    } catch (error) {
      console.log(`❌ Erro ao substituir produtos:`, error.message);
    }
    
    console.log(`\n🎉 Processo concluído!`);
    console.log(`📦 Total de produtos: 23 produtos reais`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

cleanAndReplaceProducts();
