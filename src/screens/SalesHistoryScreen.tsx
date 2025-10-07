import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';
import { LocalData } from '@api/local';
import { Sale, MultiSale } from '@types';
import { formatCurrencyBRL, formatDateBR } from '@utils/format';
import Card from '@components/Card';
import SaleDetailsModal from '@components/SaleDetailsModal';

export default function SalesHistoryScreen() {
  const [items, setItems] = useState<(Sale | MultiSale)[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | MultiSale | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  async function load() {
    const data = await LocalData.salesHistory();
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = (sale: Sale | MultiSale) => {
    setSelectedSale(sale);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSale(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}
        refreshControl={<RefreshControl tintColor={theme.colors.primary} refreshing={refreshing} onRefresh={onRefresh} />}
        data={items}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={({ item }) => {
          const isMultiSale = 'items' in item;
          
          if (isMultiSale) {
            const multiSale = item as MultiSale;
            return (
              <Card shadow="sm">
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Venda Múltipla ({multiSale.items.length} itens)</Text>
                    <Text style={styles.sub}>{formatDateBR(multiSale.dateISO)}</Text>
                    {multiSale.customerName && (
                      <Text style={styles.customer}>Cliente: {multiSale.customerName}</Text>
                    )}
                    {multiSale.paymentMethod && (
                      <Text style={styles.payment}>Pagamento: {multiSale.paymentMethod}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.value, { color: theme.colors.text }]}>{formatCurrencyBRL(multiSale.totalValue)}</Text>
                    <Text style={[styles.profit, { color: theme.colors.success }]}>Lucro: {formatCurrencyBRL(multiSale.totalProfit)}</Text>
                    <TouchableOpacity 
                      style={styles.detailsButton}
                      onPress={() => handleViewDetails(multiSale)}
                    >
                      <MaterialIcons name="visibility" size={16} color={theme.colors.primary} />
                      <Text style={styles.detailsText}>Detalhes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          } else {
            const sale = item as Sale;
            return (
              <Card shadow="sm">
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{sale.product}</Text>
                    <Text style={styles.sub}>{`${formatDateBR(sale.dateISO)}  •  Qtd: ${sale.quantity}`}</Text>
                    {sale.customerName && (
                      <Text style={styles.customer}>Cliente: {sale.customerName}</Text>
                    )}
                    {sale.paymentMethod && (
                      <Text style={styles.payment}>Pagamento: {sale.paymentMethod}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.value, { color: theme.colors.text }]}>{formatCurrencyBRL(sale.totalValue)}</Text>
                    <Text style={[styles.profit, { color: theme.colors.success }]}>Lucro: {formatCurrencyBRL(sale.profit)}</Text>
                    <TouchableOpacity 
                      style={styles.detailsButton}
                      onPress={() => handleViewDetails(sale)}
                    >
                      <MaterialIcons name="visibility" size={16} color={theme.colors.primary} />
                      <Text style={styles.detailsText}>Detalhes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          }
        }}
        showsVerticalScrollIndicator={false}
      />
      
      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing(1)
  },
  title: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: theme.spacing(0.5)
  },
  sub: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '500'
  },
  value: {
    fontWeight: '800',
    fontSize: 16,
    marginBottom: theme.spacing(0.5)
  },
  profit: {
    fontWeight: '600',
    fontSize: 14
  },
  customer: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2
  },
  payment: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(0.5),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    gap: theme.spacing(0.5)
  },
  detailsText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600'
  }
});


