import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';
import { Sale, MultiSale, Installment } from '@types';
import { formatCurrencyBRL, formatDateBR } from '@utils/format';
import { NotificationService } from '@services/NotificationService';
import { LocalData } from '@api/local';
import Card from './Card';

type NotificationItem = {
  sale: Sale | MultiSale;
  installment: Installment;
  daysUntilDue: number;
  daysOverdue?: number;
  type: 'upcoming' | 'overdue';
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function NotificationCenter({ visible, onClose }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { upcoming, overdue } = await NotificationService.checkUpcomingPayments();
      
      const notificationItems: NotificationItem[] = [
        ...upcoming.map(item => ({
          ...item,
          type: 'upcoming' as const
        })),
        ...overdue.map(item => ({
          ...item,
          type: 'overdue' as const,
          daysOverdue: item.daysOverdue
        }))
      ];
      
      setNotifications(notificationItems);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: 'upcoming' | 'overdue', days: number): keyof typeof MaterialIcons.glyphMap => {
    if (type === 'overdue') return 'warning';
    if (days === 0) return 'schedule';
    if (days <= 3) return 'notification-important';
    return 'event';
  };

  const getNotificationColor = (type: 'upcoming' | 'overdue', days: number) => {
    if (type === 'overdue') {
      return theme.colors.danger;
    }
    
    if (days === 0) {
      return theme.colors.warning;
    } else if (days <= 3) {
      return theme.colors.warning;
    } else {
      return theme.colors.primary;
    }
  };

  const getNotificationTitle = (type: 'upcoming' | 'overdue', days: number) => {
    if (type === 'overdue') {
      return `Pagamento Atrasado há ${days} dia${days > 1 ? 's' : ''}`;
    }
    
    if (days === 0) {
      return 'Pagamento Vence Hoje';
    } else if (days === 1) {
      return 'Pagamento Vence Amanhã';
    } else {
      return `Pagamento Vence em ${days} dias`;
    }
  };

  const handleMarkAsPaid = async (notification: NotificationItem) => {
    Alert.alert(
      'Confirmar Pagamento',
      `Confirmar o recebimento da parcela ${notification.installment.number} no valor de ${formatCurrencyBRL(notification.installment.value)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              // Update the installment status
              const sales = await LocalData.salesHistory();
              const saleIndex = sales.findIndex(s => s.dateISO === notification.sale.dateISO);
              
              if (saleIndex >= 0 && sales[saleIndex].installments) {
                const installmentIndex = sales[saleIndex].installments!.findIndex(
                  inst => inst.id === notification.installment.id
                );
                
                if (installmentIndex >= 0) {
                  sales[saleIndex].installments![installmentIndex].status = 'paid';
                  sales[saleIndex].installments![installmentIndex].paidDate = new Date().toISOString();
                  
                  // Update the sale status
                  const allPaid = sales[saleIndex].installments!.every(inst => inst.status === 'paid');
                  sales[saleIndex].status = allPaid ? 'paid' : 'partial';
                  
                  // Save back to storage
                  await LocalData.seedSalesIfEmpty(sales);
                  // Push installment status update to Sheets (append a new row reflecting paidDate)
                  try {
                    await fetch('/.netlify/functions/sheets?table=installments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        mode: 'append',
                        rows: [{
                          saleDateISO: sales[saleIndex].dateISO,
                          installmentId: sales[saleIndex].installments![installmentIndex].id,
                          number: sales[saleIndex].installments![installmentIndex].number,
                          value: sales[saleIndex].installments![installmentIndex].value,
                          dueDate: sales[saleIndex].installments![installmentIndex].dueDate,
                          status: sales[saleIndex].installments![installmentIndex].status,
                          paidDate: sales[saleIndex].installments![installmentIndex].paidDate || ''
                        }]
                      })
                    });
                  } catch {}
                  await loadNotifications();
                  
                  Alert.alert('Sucesso', 'Pagamento confirmado com sucesso!');
                }
              }
            } catch (error) {
              Alert.alert('Erro', 'Falha ao confirmar pagamento');
            }
          }
        }
      ]
    );
  };

  const renderNotificationItem = (notification: NotificationItem, index: number) => {
    const customerName = notification.sale.customerName || 'Cliente não informado';
    const productName = 'items' in notification.sale ? 
      notification.sale.items.map(item => item.product).join(', ') : 
      notification.sale.product;
    
    const icon = getNotificationIcon(notification.type, notification.daysUntilDue);
    const color = getNotificationColor(notification.type, notification.daysUntilDue);
    const title = getNotificationTitle(notification.type, notification.daysUntilDue);
    
    return (
      <Card key={index} shadow="sm" style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <MaterialIcons name={icon} size={24} color={color} />
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{title}</Text>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.installmentInfo}>
              Parcela {notification.installment.number} de {notification.sale.installments?.length}
            </Text>
          </View>
          <View style={styles.notificationValues}>
            <Text style={styles.amount}>{formatCurrencyBRL(notification.installment.value)}</Text>
            <Text style={styles.dueDate}>
              {formatDateBR(notification.installment.dueDate)}
            </Text>
          </View>
        </View>
        
        <View style={styles.notificationActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.payButton]}
            onPress={() => handleMarkAsPaid(notification)}
          >
            <MaterialIcons name="check" size={16} color="white" />
            <Text style={styles.actionButtonText}>Marcar como Pago</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notificações</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando notificações...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="check-circle-outline" size={48} color={theme.colors.success} />
                <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
                <Text style={styles.emptySubtitle}>Todos os pagamentos estão em dia!</Text>
              </View>
            ) : (
              notifications.map((notification, index) => renderNotificationItem(notification, index))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: '80%',
    ...theme.shadows.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text
  },
  closeButton: {
    padding: theme.spacing(0.5)
  },
  content: {
    flex: 1,
    padding: theme.spacing(2)
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing(4)
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.muted
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing(4)
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing(2)
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: theme.spacing(1),
    textAlign: 'center'
  },
  notificationCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2)
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2)
  },
  notificationIcon: {
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(0.5)
  },
  notificationContent: {
    flex: 1,
    marginRight: theme.spacing(2)
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5)
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5)
  },
  productName: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.spacing(0.5)
  },
  installmentInfo: {
    fontSize: 12,
    color: theme.colors.muted
  },
  notificationValues: {
    alignItems: 'flex-end'
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5)
  },
  dueDate: {
    fontSize: 12,
    color: theme.colors.muted
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(1),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.sm,
    gap: theme.spacing(0.5)
  },
  payButton: {
    backgroundColor: theme.colors.success
  },
  actionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600'
  }
});
