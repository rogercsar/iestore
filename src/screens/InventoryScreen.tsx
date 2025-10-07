import React, { useEffect, useState } from 'react';
import { FlatList, View, RefreshControl, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';
import { LocalData } from '@api/local';
import { Product } from '@types';
import ProductListItem from '@components/ProductListItem';
import Card from '@components/Card';
import ModernSelect from '@components/ModernSelect';
import { formatCurrencyBRL } from '@utils/format';
import { generatePublicProductUrl } from '@utils/publicRoutes';

export default function InventoryScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<Product[]>([]);
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  async function load() {
    const data = await LocalData.listProducts();
    setItems(data);
    setFilteredItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchText.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      // For now, we'll use a simple filter based on product name patterns
      // In a real app, you'd have a category field in the Product type
      filtered = filtered.filter(item => {
        const name = item.name.toLowerCase();
        switch (filterBy) {
          case 'eletronicos':
            return name.includes('cabo') || name.includes('carregador') || name.includes('fone') || name.includes('mouse');
          case 'acessorios':
            return name.includes('capinha') || name.includes('película') || name.includes('pulseira');
          case 'garrafas':
            return name.includes('garrafa') || name.includes('stanley');
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'price':
          return b.unitPrice - a.unitPrice;
        case 'profit':
          return (b.unitPrice - b.cost) - (a.unitPrice - a.cost);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [items, searchText, sortBy, filterBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    navigation.navigate('EditProduct' as never, { product } as never);
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      const products = await LocalData.listProducts();
      const updatedProducts = products.filter(p => p.name !== product.name);
      await LocalData.seedProductsIfEmpty(updatedProducts);
      await load();
      Alert.alert('Sucesso', 'Produto excluído com sucesso!');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Falha ao excluir produto');
    }
  };

  const handleShareProduct = async (product: Product) => {
    const publicUrl = generatePublicProductUrl(product.name);
    const message = `🛍️ *${product.name}*\n\n💰 Preço: ${formatCurrencyBRL(product.unitPrice)}\n📦 Estoque: ${product.quantity} unidades\n\n🔗 Ver detalhes: ${publicUrl}`;
    
    try {
      await Share.share({
        message,
        title: product.name,
        url: publicUrl
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleViewDetails = (product: Product) => {
    navigation.navigate('ProductDetails' as never, { product } as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estoque</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct' as never)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <Card shadow="sm" style={styles.filtersCard}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={theme.colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar produtos..."
            placeholderTextColor={theme.colors.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <ModernSelect
              options={[
                { label: "Todos", value: "all" },
                { label: "Eletrônicos", value: "eletronicos" },
                { label: "Acessórios", value: "acessorios" },
                { label: "Garrafas", value: "garrafas" }
              ]}
              selectedValue={filterBy}
              onValueChange={setFilterBy}
              placeholder="Categoria"
            />
          </View>
          
          <View style={styles.filterGroup}>
            <ModernSelect
              options={[
                { label: "Nome", value: "name" },
                { label: "Quantidade", value: "quantity" },
                { label: "Preço", value: "price" },
                { label: "Lucro", value: "profit" }
              ]}
              selectedValue={sortBy}
              onValueChange={setSortBy}
              placeholder="Ordenar"
            />
          </View>
        </View>
      </Card>

      {/* Products List */}
      <FlatList
        contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}
        refreshControl={<RefreshControl tintColor={theme.colors.primary} refreshing={refreshing} onRefresh={onRefresh} />}
        data={filteredItems}
        keyExtractor={(it) => it.name}
        renderItem={({ item }) => (
          <ProductListItem 
            product={item}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onShare={handleShareProduct}
            onViewDetails={handleViewDetails}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card shadow="sm" style={styles.emptyCard}>
            <MaterialIcons name="inventory-2" size={48} color={theme.colors.muted} />
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? 'Tente ajustar os filtros de pesquisa' : 'Adicione seu primeiro produto'}
            </Text>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.md,
    gap: theme.spacing(1)
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  filtersCard: {
    margin: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    marginLeft: theme.spacing(1)
  },
  filtersRow: {
    flexDirection: 'row',
    gap: theme.spacing(2)
  },
  filterGroup: {
    flex: 1
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing(4)
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing(2)
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: theme.spacing(1),
    textAlign: 'center'
  }
});


