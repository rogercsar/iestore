// Sistema de categorização automática de produtos
export class ProductCategorizer {
  private static categories = {
    'Bebidas': ['café', 'água', 'refrigerante', 'suco', 'cerveja', 'vinho', 'whisky', 'vodka', 'energético', 'chá', 'mate'],
    'Alimentação': ['pão', 'sanduíche', 'hambúrguer', 'pizza', 'salada', 'fruta', 'doce', 'chocolate', 'biscoito', 'bolo', 'torta'],
    'Higiene': ['sabonete', 'shampoo', 'condicionador', 'creme', 'desodorante', 'pasta', 'escova', 'papel', 'absorvente'],
    'Limpeza': ['detergente', 'sabão', 'desinfetante', 'álcool', 'água sanitária', 'esponja', 'paninho', 'vassoura'],
    'Eletrônicos': ['celular', 'smartphone', 'tablet', 'notebook', 'computador', 'fone', 'carregador', 'cabo', 'bateria'],
    'Roupas': ['camiseta', 'calça', 'vestido', 'sapato', 'tênis', 'meia', 'cueca', 'sutiã', 'bermuda', 'jaqueta'],
    'Casa': ['mesa', 'cadeira', 'sofá', 'cama', 'armário', 'geladeira', 'fogão', 'microondas', 'tv', 'ar condicionado'],
    'Esportes': ['bola', 'raquete', 'tênis', 'chuteira', 'bicicleta', 'patins', 'skate', 'peso', 'halter', 'esteira'],
    'Livros': ['livro', 'revista', 'jornal', 'caderno', 'caneta', 'lápis', 'borracha', 'régua', 'mochila'],
    'Ferramentas': ['martelo', 'chave', 'furadeira', 'parafuso', 'prego', 'fita', 'cola', 'tinta', 'pincel'],
    'Automotivo': ['pneu', 'óleo', 'bateria', 'filtro', 'vela', 'freio', 'volante', 'banco', 'cinto'],
    'Beleza': ['batom', 'sombra', 'base', 'rimel', 'perfume', 'colônia', 'loção', 'protetor', 'maquiagem'],
    'Saúde': ['remédio', 'vitamina', 'suplemento', 'termômetro', 'curativo', 'gaze', 'álcool', 'seringa'],
    'Brinquedos': ['boneca', 'carrinho', 'lego', 'jogo', 'puzzle', 'urso', 'pelúcia', 'bicicleta', 'patinete'],
    'Jardim': ['vaso', 'terra', 'semente', 'muda', 'adubo', 'regador', 'tesoura', 'luva', 'pá', 'enxada']
  }

  static categorize(productName: string): string {
    const name = productName.toLowerCase()
    
    // Busca por palavras-chave nas categorias
    for (const [category, keywords] of Object.entries(this.categories)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          return category
        }
      }
    }
    
    // Se não encontrar, retorna categoria padrão
    return 'Outros'
  }

  static getAllCategories(): string[] {
    return Object.keys(this.categories)
  }

  static getKeywordsForCategory(category: string): string[] {
    return this.categories[category as keyof typeof this.categories] || []
  }
}
