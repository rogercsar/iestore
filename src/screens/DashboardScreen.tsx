import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';
import Card from '@components/Card';
import Section from '@components/Section';
import HeaderMenu from '@components/HeaderMenu';
import { LocalData } from '@api/local';
import { DashboardSummary, Product, Sale, MultiSale } from '@types';
import { VictoryArea, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { formatCurrencyBRL, formatDateBR } from '@utils/format';
import { Alert } from 'react-native';
import { NotificationService } from '@services/NotificationService';
import NotificationCenter from '@components/NotificationCenter';

type Props = {
  onLogout: () => Promise<void>;
};

export default function DashboardScreen({ onLogout }: Props) {
  const navigation = useNavigation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [summaryData, productsData, salesData] = await Promise.all([
        LocalData.summary('weekly'),
        LocalData.listProducts(),
        LocalData.salesHistory()
      ]);
      setSummary(summaryData);
      setProducts(productsData);
      
      // Calculate pending amount from sales with installments
      const pending = salesData.reduce((total, sale) => {
        if (sale.installments && sale.installments.length > 0) {
          const unpaidInstallments = sale.installments.filter(inst => inst.status === 'pending' || inst.status === 'overdue');
          return total + unpaidInstallments.reduce((sum, inst) => sum + inst.value, 0);
        }
        return total;
      }, 0);
      setPendingAmount(pending);
      
      // Load notification count
      const count = await NotificationService.getNotificationCount();
      setNotificationCount(count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Request notification permissions and schedule reminders
    NotificationService.requestPermissions().then(hasPermission => {
      if (hasPermission) {
        NotificationService.schedulePaymentReminders();
      }
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await onLogout();
  };


  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} refreshControl={<RefreshControl tintColor={theme.colors.primary} refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing(1) }}>
          <TouchableOpacity
            onPress={() => setShowNotificationCenter(true)}
            style={styles.notificationButton}
          >
            <MaterialIcons name="notifications" size={20} color={theme.colors.text} />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <HeaderMenu onLogout={handleLogout} />
        </View>
      </View>
      
      <View style={{ padding: theme.spacing(2) }}>
            <Section title="Resumo do Negócio">
              <View style={{ flexDirection: 'row', gap: theme.spacing(2) }}>
                <View style={{ flex: 1 }}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={{ borderRadius: theme.radius.lg, padding: theme.spacing(2) }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginBottom: theme.spacing(1) }}>Total de Vendas</Text>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>
                      {summary ? formatCurrencyBRL(summary.totalSalesValue || 0) : '—'}
                    </Text>
                  </LinearGradient>
                </View>
                <View style={{ flex: 1 }}>
                  <LinearGradient
                    colors={[theme.colors.success, theme.colors.successLight]}
                    style={{ borderRadius: theme.radius.lg, padding: theme.spacing(2) }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginBottom: theme.spacing(1) }}>Lucro Total</Text>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>
                      {summary ? formatCurrencyBRL(summary.totalProfit || 0) : '—'}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
              
              {/* Valores a Receber Card */}
              <TouchableOpacity 
                style={{ marginTop: theme.spacing(2) }}
                onPress={() => navigation.navigate('PendingPayments' as never)}
              >
                <LinearGradient
                  colors={[theme.colors.warning, theme.colors.warningLight]}
                  style={{ borderRadius: theme.radius.lg, padding: theme.spacing(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginBottom: theme.spacing(1) }}>Valores a Receber</Text>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>
                      {formatCurrencyBRL(pendingAmount)}
                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </Section>

        <Section title="Indicadores de Produtos">
          <View style={{ flexDirection: 'row', gap: theme.spacing(2) }}>
            <Card padding={theme.spacing(2)} shadow="sm" style={{ flex: 1 }}>
              <View style={styles.indicator}>
                <MaterialIcons name="inventory" size={24} color={theme.colors.primary} />
                <Text style={styles.indicatorValue}>{products.length}</Text>
                <Text style={styles.indicatorLabel}>Total Produtos</Text>
              </View>
            </Card>
            <Card padding={theme.spacing(2)} shadow="sm" style={{ flex: 1 }}>
              <View style={styles.indicator}>
                <MaterialIcons name="warning" size={24} color={theme.colors.danger} />
                <Text style={styles.indicatorValue}>
                  {products.filter(p => p.quantity <= 5).length}
                </Text>
                <Text style={styles.indicatorLabel}>Estoque Baixo</Text>
              </View>
            </Card>
            <Card padding={theme.spacing(2)} shadow="sm" style={{ flex: 1 }}>
              <View style={styles.indicator}>
                <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
                <Text style={styles.indicatorValue}>
                  {products.filter(p => p.quantity > 10).length}
                </Text>
                <Text style={styles.indicatorLabel}>Estoque OK</Text>
              </View>
            </Card>
          </View>
        </Section>

        <Section title="Promoções Sugeridas">
          <Card padding={theme.spacing(2)} shadow="sm">
            <Text style={styles.promoTitle}>💡 Movimente seu estoque!</Text>
            {products.filter(p => p.quantity > 10).slice(0, 3).map((product, index) => (
              <View key={index} style={styles.promoItem}>
                <View style={styles.promoInfo}>
                  <Text style={styles.promoProduct}>{product.name}</Text>
                  <Text style={styles.promoStock}>{product.quantity} em estoque</Text>
                </View>
                <View style={styles.promoAction}>
                  <Text style={styles.promoPrice}>{formatCurrencyBRL(product.unitPrice)}</Text>
                  <Text style={styles.promoDiscount}>-20%</Text>
                </View>
              </View>
            ))}
          </Card>
        </Section>

        <Section title="Desempenho Semanal">
          <Card padding={theme.spacing(2)} shadow="lg">
            {loading && <ActivityIndicator color={theme.colors.primary} size="large" />}
            {!loading && summary && (
              <View style={{ height: 240 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing(1) }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Vendas por dia</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing(1) }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary }} />
                    <Text style={{ color: theme.colors.muted, fontSize: 12 }}>Total vendido</Text>
                  </View>
                </View>
                <VictoryChart 
                  theme={VictoryTheme.material} 
                  domainPadding={{ x: 20, y: 20 }}
                  padding={{ left: 50, right: 20, top: 10, bottom: 40 }}
                  accessibility={false}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: theme.colors.border },
                      grid: { stroke: 'transparent' },
                      tickLabels: { fill: theme.colors.muted, fontSize: 10, angle: 0 }
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: theme.colors.border },
                      grid: { stroke: theme.colors.border + '80' },
                      tickLabels: { fill: theme.colors.muted, fontSize: 10 }
                    }}
                  />
                  <VictoryArea
                    interpolation="monotoneX"
                    style={{ 
                      data: { 
                        fill: theme.colors.primary, 
                        stroke: theme.colors.primary, 
                        fillOpacity: 0.2,
                        strokeWidth: 2
                      } 
                    }}
                    data={summary.series.map((p) => ({ x: p.label, y: p.value }))}
                  />
                </VictoryChart>
              </View>
            )}
          </Card>
        </Section>
      </View>
      
      {/* Notification Center */}
      <NotificationCenter
        visible={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </ScrollView>
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
  notificationButton: {
    position: 'relative',
    padding: theme.spacing(1)
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700'
  },
  indicator: {
    alignItems: 'center',
    gap: theme.spacing(0.5)
  },
  indicatorValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text
  },
  indicatorLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'center'
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(2)
  },
  promoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(1),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  promoInfo: {
    flex: 1
  },
  promoProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  promoStock: {
    fontSize: 12,
    color: theme.colors.muted
  },
  promoAction: {
    alignItems: 'flex-end'
  },
  promoPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  promoDiscount: {
    fontSize: 12,
    color: theme.colors.danger,
    fontWeight: '600'
  }
});


