import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import theme from '@theme';
import { LocalData } from '@api/local';
import { Customer } from '@types';
import { formatCurrencyBRL, formatDateBR } from '@utils/format';
import Card from '@components/Card';

export default function CustomersScreen() {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  // Reload customers when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCustomers();
    }, [])
  );

  const loadCustomers = async () => {
    try {
      const customersData = await LocalData.listCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCustomers();
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    Alert.alert(
      'Detalhes do Cliente',
      `Nome: ${customer.name}\nTelefone: ${customer.phone}\nEmail: ${customer.email || 'Não informado'}\nTotal de Compras: ${customer.totalPurchases}\nValor Total: ${formatCurrencyBRL(customer.totalValue)}\nValor Pendente: ${formatCurrencyBRL(customer.pendingAmount)}\nÚltima Compra: ${customer.lastPurchase ? formatDateBR(customer.lastPurchase) : 'Nunca'}`,
      [{ text: 'OK' }]
    );
  };

  const handleEditCustomer = (customer: Customer) => {
    // Implementar edição de cliente
    Alert.alert('Editar Cliente', 'Funcionalidade será implementada');
  };

  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      'Excluir Cliente',
      `Tem certeza que deseja excluir ${customer.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalData.deleteCustomer(customer.id);
              await loadCustomers(); // Reload the list
              Alert.alert('Sucesso', 'Cliente excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir cliente');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (customer: Customer) => {
    if (customer.pendingAmount > 0) return theme.colors.danger;
    if (customer.totalPurchases >= 5) return theme.colors.success;
    return theme.colors.muted;
  };

  const getStatusText = (customer: Customer) => {
    if (customer.pendingAmount > 0) return 'Em Débito';
    if (customer.totalPurchases >= 5) return 'Cliente VIP';
    return 'Ativo';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clientes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCustomer' as never)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={({ item: customer }) => (
          <Card shadow="sm" style={styles.customerCard}>
            <View style={styles.customerHeader}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerPhone}>{customer.phone}</Text>
                {customer.email && (
                  <Text style={styles.customerEmail}>{customer.email}</Text>
                )}
              </View>
              <View style={styles.customerActions}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(customer) }]}>
                  <Text style={styles.statusText}>{getStatusText(customer)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewCustomer(customer)}
                >
                  <MaterialIcons name="eye" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditCustomer(customer)}
                >
                  <MaterialIcons name="create" size={16} color={theme.colors.warning} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteCustomer(customer)}
                >
                  <MaterialIcons name="trash" size={16} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.customerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Compras</Text>
                <Text style={styles.statValue}>{customer.totalPurchases}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Gasto</Text>
                <Text style={styles.statValue}>{formatCurrencyBRL(customer.totalValue)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Pendente</Text>
                <Text style={[styles.statValue, { color: customer.pendingAmount > 0 ? theme.colors.danger : theme.colors.success }]}>
                  {formatCurrencyBRL(customer.pendingAmount)}
                </Text>
              </View>
            </View>

            {customer.lastPurchase && (
              <Text style={styles.lastPurchase}>
                Última compra: {formatDateBR(customer.lastPurchase)}
              </Text>
            )}

            {customer.notes && (
              <Text style={styles.notes}>{customer.notes}</Text>
            )}
          </Card>
        )}
        refreshControl={
          <RefreshControl
            tintColor={theme.colors.primary}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card shadow="sm" style={styles.emptyCard}>
            <MaterialIcons name="people-outline" size={48} color={theme.colors.muted} />
            <Text style={styles.emptyText}>Nenhum cliente cadastrado</Text>
            <Text style={styles.emptySubtext}>Adicione clientes para acompanhar suas compras</Text>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
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
  list: {
    padding: theme.spacing(2),
    gap: theme.spacing(2)
  },
  customerCard: {
    padding: theme.spacing(2)
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2)
  },
  customerInfo: {
    flex: 1
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5)
  },
  customerPhone: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing(0.5)
  },
  customerEmail: {
    fontSize: 12,
    color: theme.colors.muted
  },
  customerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  statusBadge: {
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(0.5),
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing(1)
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white'
  },
  actionButton: {
    padding: theme.spacing(0.5)
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing(0.5)
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text
  },
  lastPurchase: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing(1)
  },
  notes: {
    fontSize: 12,
    color: theme.colors.muted,
    fontStyle: 'italic',
    textAlign: 'center'
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
